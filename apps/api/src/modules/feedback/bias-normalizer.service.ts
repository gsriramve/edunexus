import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Bias Normalizer Service
 *
 * Handles evaluator bias detection and score normalization for 360° feedback.
 *
 * Key concepts:
 * - Bias Factor: A multiplier indicating how lenient/strict an evaluator is
 *   - >1.0 = Lenient evaluator (gives higher scores than average)
 *   - <1.0 = Strict evaluator (gives lower scores than average)
 *   - ~1.0 = Neutral evaluator (close to average)
 *
 * - Normalization: Adjusts raw scores to account for evaluator bias
 *   Normalized Score = Raw Score / Bias Factor
 *
 * This ensures fair comparison of students regardless of who evaluates them.
 */

export interface EvaluatorStats {
  evaluatorId: string;
  evaluatorType: string;
  totalEvaluations: number;
  averageScore: number;
  standardDeviation: number;
  biasFactor: number;
  scores: number[];
}

export interface NormalizationResult {
  rawScore: number;
  normalizedScore: number;
  biasFactor: number;
  confidence: number; // How confident we are in the normalization (based on sample size)
}

@Injectable()
export class BiasNormalizerService {
  private readonly logger = new Logger(BiasNormalizerService.name);

  // Minimum evaluations needed for reliable bias calculation
  private readonly MIN_EVALUATIONS_FOR_BIAS = 5;

  // Global average score (used as baseline)
  private readonly BASELINE_SCORE = 3.5; // On a 1-5 scale

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate bias factor for an evaluator based on their historical feedback
   */
  async calculateEvaluatorBias(
    tenantId: string,
    evaluatorId: string,
    evaluatorType: string,
  ): Promise<EvaluatorStats> {
    // Get all feedback entries from this evaluator
    const entries = await this.prisma.feedbackEntry.findMany({
      where: {
        tenantId,
        evaluatorId,
        evaluatorType,
        submittedAt: { not: null },
        rawAverageScore: { not: null },
      },
      select: {
        rawAverageScore: true,
      },
    });

    const scores = entries
      .map(e => e.rawAverageScore)
      .filter((s): s is number => s !== null);

    if (scores.length === 0) {
      return {
        evaluatorId,
        evaluatorType,
        totalEvaluations: 0,
        averageScore: this.BASELINE_SCORE,
        standardDeviation: 0,
        biasFactor: 1.0,
        scores: [],
      };
    }

    // Calculate statistics
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - averageScore, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Calculate bias factor relative to baseline
    // If evaluator average is 4.0 and baseline is 3.5, bias = 4.0/3.5 = 1.14 (lenient)
    const biasFactor = averageScore / this.BASELINE_SCORE;

    return {
      evaluatorId,
      evaluatorType,
      totalEvaluations: scores.length,
      averageScore: Math.round(averageScore * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      biasFactor: Math.round(biasFactor * 1000) / 1000,
      scores,
    };
  }

  /**
   * Calculate bias factors for all evaluators in a tenant
   */
  async calculateAllEvaluatorBiases(tenantId: string): Promise<EvaluatorStats[]> {
    // Get unique evaluators
    const evaluators = await this.prisma.feedbackEntry.findMany({
      where: {
        tenantId,
        evaluatorId: { not: null },
        submittedAt: { not: null },
      },
      select: {
        evaluatorId: true,
        evaluatorType: true,
      },
      distinct: ['evaluatorId', 'evaluatorType'],
    });

    const biases: EvaluatorStats[] = [];

    for (const evaluator of evaluators) {
      if (evaluator.evaluatorId) {
        const stats = await this.calculateEvaluatorBias(
          tenantId,
          evaluator.evaluatorId,
          evaluator.evaluatorType,
        );
        biases.push(stats);
      }
    }

    return biases;
  }

  /**
   * Normalize a single feedback score based on evaluator bias
   */
  async normalizeScore(
    tenantId: string,
    rawScore: number,
    evaluatorId: string | null,
    evaluatorType: string,
  ): Promise<NormalizationResult> {
    // If no evaluator ID (anonymous or self), use type-based normalization
    if (!evaluatorId) {
      const typeBias = await this.calculateTypeBias(tenantId, evaluatorType);
      return this.applyNormalization(rawScore, typeBias.biasFactor, typeBias.sampleSize);
    }

    // Get evaluator's bias
    const evaluatorStats = await this.calculateEvaluatorBias(tenantId, evaluatorId, evaluatorType);

    // If not enough data, use type-based bias as fallback
    if (evaluatorStats.totalEvaluations < this.MIN_EVALUATIONS_FOR_BIAS) {
      const typeBias = await this.calculateTypeBias(tenantId, evaluatorType);
      // Blend individual and type bias based on sample size
      const blendWeight = evaluatorStats.totalEvaluations / this.MIN_EVALUATIONS_FOR_BIAS;
      const blendedBias = (evaluatorStats.biasFactor * blendWeight) + (typeBias.biasFactor * (1 - blendWeight));
      return this.applyNormalization(rawScore, blendedBias, evaluatorStats.totalEvaluations);
    }

    return this.applyNormalization(rawScore, evaluatorStats.biasFactor, evaluatorStats.totalEvaluations);
  }

  /**
   * Calculate average bias for an evaluator type (faculty, peer, etc.)
   */
  async calculateTypeBias(
    tenantId: string,
    evaluatorType: string,
  ): Promise<{ biasFactor: number; sampleSize: number }> {
    const entries = await this.prisma.feedbackEntry.findMany({
      where: {
        tenantId,
        evaluatorType,
        submittedAt: { not: null },
        rawAverageScore: { not: null },
      },
      select: {
        rawAverageScore: true,
      },
    });

    const scores = entries
      .map(e => e.rawAverageScore)
      .filter((s): s is number => s !== null);

    if (scores.length === 0) {
      return { biasFactor: 1.0, sampleSize: 0 };
    }

    const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const biasFactor = average / this.BASELINE_SCORE;

    return {
      biasFactor: Math.round(biasFactor * 1000) / 1000,
      sampleSize: scores.length,
    };
  }

  /**
   * Apply normalization to a raw score
   */
  private applyNormalization(
    rawScore: number,
    biasFactor: number,
    sampleSize: number,
  ): NormalizationResult {
    // Clamp bias factor to reasonable range (0.5 to 2.0)
    const clampedBias = Math.max(0.5, Math.min(2.0, biasFactor));

    // Normalize score
    let normalizedScore = rawScore / clampedBias;

    // Clamp normalized score to valid range (1-5)
    normalizedScore = Math.max(1, Math.min(5, normalizedScore));

    // Calculate confidence based on sample size
    const confidence = Math.min(1.0, sampleSize / (this.MIN_EVALUATIONS_FOR_BIAS * 2));

    return {
      rawScore: Math.round(rawScore * 100) / 100,
      normalizedScore: Math.round(normalizedScore * 100) / 100,
      biasFactor: clampedBias,
      confidence: Math.round(confidence * 100) / 100,
    };
  }

  /**
   * Calculate raw average score from individual ratings
   */
  calculateRawAverageScore(ratings: {
    academicRating?: number | null;
    participationRating?: number | null;
    teamworkRating?: number | null;
    communicationRating?: number | null;
    leadershipRating?: number | null;
    punctualityRating?: number | null;
  }): number | null {
    const validRatings = [
      ratings.academicRating,
      ratings.participationRating,
      ratings.teamworkRating,
      ratings.communicationRating,
      ratings.leadershipRating,
      ratings.punctualityRating,
    ].filter((r): r is number => r !== null && r !== undefined);

    if (validRatings.length === 0) {
      return null;
    }

    const sum = validRatings.reduce((total, r) => total + r, 0);
    return Math.round((sum / validRatings.length) * 100) / 100;
  }

  /**
   * Detect potential bias anomalies (evaluators who are unusually lenient or strict)
   */
  async detectBiasAnomalies(
    tenantId: string,
    threshold: number = 0.3, // Deviation from 1.0
  ): Promise<EvaluatorStats[]> {
    const allBiases = await this.calculateAllEvaluatorBiases(tenantId);

    return allBiases.filter(stats => {
      // Only flag if we have enough data
      if (stats.totalEvaluations < this.MIN_EVALUATIONS_FOR_BIAS) {
        return false;
      }
      // Flag if bias is significantly different from neutral
      return Math.abs(stats.biasFactor - 1.0) > threshold;
    });
  }

  /**
   * Update stored bias factor for an evaluator in their feedback entries
   */
  async updateStoredBiasFactors(tenantId: string, evaluatorId: string): Promise<number> {
    const stats = await this.calculateEvaluatorBias(
      tenantId,
      evaluatorId,
      'faculty', // Will be overridden per entry
    );

    // Update all entries from this evaluator
    const result = await this.prisma.feedbackEntry.updateMany({
      where: {
        tenantId,
        evaluatorId,
      },
      data: {
        evaluatorBiasFactor: stats.biasFactor,
      },
    });

    return result.count;
  }

  /**
   * Recalculate normalized scores for all entries in a cycle
   */
  async recalculateCycleNormalization(tenantId: string, cycleId: string): Promise<number> {
    const entries = await this.prisma.feedbackEntry.findMany({
      where: {
        tenantId,
        cycleId,
        submittedAt: { not: null },
        rawAverageScore: { not: null },
      },
    });

    let updatedCount = 0;

    for (const entry of entries) {
      if (entry.rawAverageScore === null) continue;

      const normalization = await this.normalizeScore(
        tenantId,
        entry.rawAverageScore,
        entry.evaluatorId,
        entry.evaluatorType,
      );

      await this.prisma.feedbackEntry.update({
        where: { id: entry.id },
        data: {
          normalizedScore: normalization.normalizedScore,
          evaluatorBiasFactor: normalization.biasFactor,
        },
      });

      updatedCount++;
    }

    this.logger.log(`Recalculated normalization for ${updatedCount} entries in cycle ${cycleId}`);
    return updatedCount;
  }
}
