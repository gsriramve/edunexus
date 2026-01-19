#!/bin/bash

# Edu-Nexus Premium Marketing Video
# Duration: ~2:30 (150 seconds)
# Focus: Pain points, Solutions, Features - NO PRICING
# Professional storytelling with emotional hooks

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

FFMPEG="ffmpeg"
if command -v /opt/homebrew/opt/ffmpeg-full/bin/ffmpeg &> /dev/null; then
    FFMPEG="/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg"
fi

echo "=========================================="
echo "Creating Edu-Nexus Premium Marketing Video"
echo "Focus: Pain Points & Solutions"
echo "NO PRICING - Value Proposition Only"
echo "=========================================="

$FFMPEG -y \
  -loop 1 -t 6 -i 01-landing.png \
  -loop 1 -t 7 -i 02-platform-owner-dashboard.png \
  -loop 1 -t 7 -i 04-principal-dashboard.png \
  -loop 1 -t 6 -i 06-hod-dashboard.png \
  -loop 1 -t 6 -i 07-admin-dashboard.png \
  -loop 1 -t 6 -i 08-teacher-dashboard.png \
  -loop 1 -t 5 -i 09-lab-assistant-dashboard.png \
  -loop 1 -t 7 -i 10-student-dashboard.png \
  -loop 1 -t 6 -i 11-parent-dashboard.png \
  -loop 1 -t 5 -i 12-alumni-dashboard.png \
  -i bgmusic.mp3 \
  -filter_complex "
    color=c=0x0f172a:s=1920x1080:d=6:r=30[intro];
    color=c=0x0f172a:s=1920x1080:d=12:r=30[problem];
    color=c=0x1e3a5f:s=1920x1080:d=6:r=30[solution];
    color=c=0x0f172a:s=1920x1080:d=8:r=30[aipower];
    color=c=0x0f172a:s=1920x1080:d=8:r=30[results];
    color=c=0x1e40af:s=1920x1080:d=7:r=30[cta];

    [intro]
      drawtext=text='edu-nexus':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=100:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-80:alpha='if(lt(t,1.2),t/1.2,1)',
      drawtext=text='AI-Powered College Management':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=28:fontcolor=0x94a3b8:x=(w-text_w)/2:y=(h-text_h)/2+40:alpha='if(lt(t,2),0,if(lt(t,3),(t-2),1))',
      drawtext=text='Powered by Quantumlayer Platform':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=18:fontcolor=0x64748b:x=(w-text_w)/2:y=(h-text_h)/2+90:alpha='if(lt(t,3.5),0,if(lt(t,4.5),(t-3.5),1))'
    [vintro];

    [problem]
      drawtext=text='THE REALITY':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=20:fontcolor=0xef4444:x=(w-text_w)/2:y=(h-text_h)/2-200:alpha='if(lt(t,0.8),t/0.8,1)',
      drawtext=text='Managing 5000+ Students':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=52:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-130:alpha='if(lt(t,1.5),0,if(lt(t,2.3),(t-1.5)/0.8,1))',
      drawtext=text='Feels Like This...':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=52:fontcolor=0xfbbf24:x=(w-text_w)/2:y=(h-text_h)/2-60:alpha='if(lt(t,2.5),0,if(lt(t,3.3),(t-2.5)/0.8,1))',
      drawtext=text='✗  40+ hours/month wasted on manual work':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=0xef4444:x=(w-text_w)/2:y=(h-text_h)/2+30:alpha='if(lt(t,4),0,if(lt(t,4.8),(t-4)/0.8,1))',
      drawtext=text='✗  At-risk students discovered too late':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=0xef4444:x=(w-text_w)/2:y=(h-text_h)/2+70:alpha='if(lt(t,5),0,if(lt(t,5.8),(t-5)/0.8,1))',
      drawtext=text='✗  Fee collection is a never-ending chase':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=0xef4444:x=(w-text_w)/2:y=(h-text_h)/2+110:alpha='if(lt(t,6),0,if(lt(t,6.8),(t-6)/0.8,1))',
      drawtext=text='✗  Data scattered across 10 different systems':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=0xef4444:x=(w-text_w)/2:y=(h-text_h)/2+150:alpha='if(lt(t,7),0,if(lt(t,7.8),(t-7)/0.8,1))',
      drawtext=text='✗  Parents feel disconnected and frustrated':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=0xef4444:x=(w-text_w)/2:y=(h-text_h)/2+190:alpha='if(lt(t,8),0,if(lt(t,8.8),(t-8)/0.8,1))',
      drawtext=text='There is a better way.':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=36:fontcolor=0x22c55e:x=(w-text_w)/2:y=(h-text_h)/2+280:alpha='if(lt(t,10),0,if(lt(t,11),(t-10),1))'
    [vproblem];

    [solution]
      drawtext=text='THE SOLUTION':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=20:fontcolor=0x22c55e:x=(w-text_w)/2:y=(h-text_h)/2-120:alpha='if(lt(t,0.8),t/0.8,1)',
      drawtext=text='One Intelligent Platform':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=56:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-40:alpha='if(lt(t,1.5),0,if(lt(t,2.3),(t-1.5)/0.8,1))',
      drawtext=text='9 Portals  •  20+ Modules  •  AI-Powered':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=0x93c5fd:x=(w-text_w)/2:y=(h-text_h)/2+40:alpha='if(lt(t,3),0,if(lt(t,3.8),(t-3)/0.8,1))',
      drawtext=text='Built for Indian Engineering Colleges':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=22:fontcolor=0x64748b:x=(w-text_w)/2:y=(h-text_h)/2+100:alpha='if(lt(t,4),0,if(lt(t,4.8),(t-4)/0.8,1))'
    [vsolution];

    [0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:0x0f172a,fps=30,
      zoompan=z='1.06-on*0.00015':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-90:w=iw:h=90:color=0x0f172a@0.9:t=fill,
      drawtext=text='Complete College Visibility in One Dashboard':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=28:fontcolor=white:x=(w-text_w)/2:y=h-55:alpha='if(lt(t,1),t,1)'
    [v0];

    [1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:0x0f172a,fps=30,
      zoompan=z='1.05-on*0.0001':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=210:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=80:color=0x2563eb@0.95:t=fill,
      drawtext=text='PLATFORM OWNER':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=50:y=28:alpha='if(lt(t,0.6),t/0.6,1)',
      drawbox=x=0:y=ih-90:w=iw:h=90:color=0x0f172a@0.9:t=fill,
      drawtext=text='Multi-College Management  •  Revenue Analytics  •  Platform Health':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=22:fontcolor=white:x=(w-text_w)/2:y=h-55:alpha='if(lt(t,1),0,if(lt(t,1.8),(t-1)/0.8,1))'
    [v1];

    [2:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:0x0f172a,fps=30,
      zoompan=z='1.05-on*0.0001':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=210:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=80:color=0x4f46e5@0.95:t=fill,
      drawtext=text='PRINCIPAL':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=50:y=28:alpha='if(lt(t,0.6),t/0.6,1)',
      drawbox=x=0:y=ih-90:w=iw:h=90:color=0x0f172a@0.9:t=fill,
      drawtext=text='Executive Dashboard  •  AI Insights  •  AICTE Compliance Reports':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=22:fontcolor=white:x=(w-text_w)/2:y=h-55:alpha='if(lt(t,1),0,if(lt(t,1.8),(t-1)/0.8,1))'
    [v2];

    [3:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:0x0f172a,fps=30,
      zoompan=z='1.05-on*0.0001':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=80:color=0x7c3aed@0.95:t=fill,
      drawtext=text='HOD':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=50:y=28:alpha='if(lt(t,0.6),t/0.6,1)',
      drawbox=x=0:y=ih-90:w=iw:h=90:color=0x0f172a@0.9:t=fill,
      drawtext=text='AI Identifies At-Risk Students in Week 2  •  Smart Workload Distribution':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=22:fontcolor=white:x=(w-text_w)/2:y=h-55:alpha='if(lt(t,1),0,if(lt(t,1.8),(t-1)/0.8,1))'
    [v3];

    [4:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:0x0f172a,fps=30,
      zoompan=z='1.05-on*0.0001':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=80:color=0x059669@0.95:t=fill,
      drawtext=text='ADMIN STAFF':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=50:y=28:alpha='if(lt(t,0.6),t/0.6,1)',
      drawbox=x=0:y=ih-90:w=iw:h=90:color=0x0f172a@0.9:t=fill,
      drawtext=text='Automated Fee Collection  •  One-Click Reports  •  Zero Manual Follow-ups':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=22:fontcolor=white:x=(w-text_w)/2:y=h-55:alpha='if(lt(t,1),0,if(lt(t,1.8),(t-1)/0.8,1))'
    [v4];

    [5:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:0x0f172a,fps=30,
      zoompan=z='1.05-on*0.0001':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=80:color=0xdc2626@0.95:t=fill,
      drawtext=text='TEACHER':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=50:y=28:alpha='if(lt(t,0.6),t/0.6,1)',
      drawbox=x=0:y=ih-90:w=iw:h=90:color=0x0f172a@0.9:t=fill,
      drawtext=text='2-Minute Attendance  •  AI Grading Assistance  •  Student Insights':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=22:fontcolor=white:x=(w-text_w)/2:y=h-55:alpha='if(lt(t,1),0,if(lt(t,1.8),(t-1)/0.8,1))'
    [v5];

    [6:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:0x0f172a,fps=30,
      zoompan=z='1.05-on*0.0001':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=80:color=0xf59e0b@0.95:t=fill,
      drawtext=text='LAB ASSISTANT':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=50:y=28:alpha='if(lt(t,0.6),t/0.6,1)',
      drawbox=x=0:y=ih-90:w=iw:h=90:color=0x0f172a@0.9:t=fill,
      drawtext=text='Practical Session Management  •  Equipment Tracking  •  Lab Scheduling':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=22:fontcolor=white:x=(w-text_w)/2:y=h-55:alpha='if(lt(t,1),0,if(lt(t,1.8),(t-1)/0.8,1))'
    [v6];

    [7:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:0x0f172a,fps=30,
      zoompan=z='1.05-on*0.0001':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=210:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=80:color=0x0ea5e9@0.95:t=fill,
      drawtext=text='STUDENT':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=50:y=28:alpha='if(lt(t,0.6),t/0.6,1)',
      drawbox=x=0:y=ih-90:w=iw:h=90:color=0x0f172a@0.9:t=fill,
      drawtext=text='AI Career Advisor  •  Placement Predictions  •  Personalized Learning Path':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=22:fontcolor=white:x=(w-text_w)/2:y=h-55:alpha='if(lt(t,1),0,if(lt(t,1.8),(t-1)/0.8,1))'
    [v7];

    [8:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:0x0f172a,fps=30,
      zoompan=z='1.05-on*0.0001':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=80:color=0xec4899@0.95:t=fill,
      drawtext=text='PARENT':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=50:y=28:alpha='if(lt(t,0.6),t/0.6,1)',
      drawbox=x=0:y=ih-90:w=iw:h=90:color=0x0f172a@0.9:t=fill,
      drawtext=text='Real-Time Updates  •  Online Fee Payment  •  Live Bus Tracking':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=22:fontcolor=white:x=(w-text_w)/2:y=h-55:alpha='if(lt(t,1),0,if(lt(t,1.8),(t-1)/0.8,1))'
    [v8];

    [9:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:0x0f172a,fps=30,
      zoompan=z='1.05-on*0.0001':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=80:color=0x6366f1@0.95:t=fill,
      drawtext=text='ALUMNI':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=50:y=28:alpha='if(lt(t,0.6),t/0.6,1)',
      drawbox=x=0:y=ih-90:w=iw:h=90:color=0x0f172a@0.9:t=fill,
      drawtext=text='AI-Matched Mentorship  •  Career Network  •  Give Back Programs':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=22:fontcolor=white:x=(w-text_w)/2:y=h-55:alpha='if(lt(t,1),0,if(lt(t,1.8),(t-1)/0.8,1))'
    [v9];

    [aipower]
      drawtext=text='POWERED BY AI':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=18:fontcolor=0x22c55e:x=(w-text_w)/2:y=(h-text_h)/2-180:alpha='if(lt(t,0.8),t/0.8,1)',
      drawtext=text='Intelligence That Works':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-110:alpha='if(lt(t,1.5),0,if(lt(t,2.3),(t-1.5)/0.8,1))',
      drawtext=text='85%':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=64:fontcolor=0x22c55e:x=w/4-50:y=(h-text_h)/2:alpha='if(lt(t,2.5),0,if(lt(t,3.3),(t-2.5)/0.8,1))',
      drawtext=text='Prediction':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=18:fontcolor=0x94a3b8:x=w/4-55:y=(h-text_h)/2+60:alpha='if(lt(t,3),0,if(lt(t,3.8),(t-3)/0.8,1))',
      drawtext=text='Accuracy':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=18:fontcolor=0x94a3b8:x=w/4-50:y=(h-text_h)/2+85:alpha='if(lt(t,3),0,if(lt(t,3.8),(t-3)/0.8,1))',
      drawtext=text='24/7':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=64:fontcolor=0x22c55e:x=w/2-40:y=(h-text_h)/2:alpha='if(lt(t,3.5),0,if(lt(t,4.3),(t-3.5)/0.8,1))',
      drawtext=text='AI Chatbot':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=18:fontcolor=0x94a3b8:x=w/2-55:y=(h-text_h)/2+60:alpha='if(lt(t,4),0,if(lt(t,4.8),(t-4)/0.8,1))',
      drawtext=text='Support':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=18:fontcolor=0x94a3b8:x=w/2-40:y=(h-text_h)/2+85:alpha='if(lt(t,4),0,if(lt(t,4.8),(t-4)/0.8,1))',
      drawtext=text='6':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=64:fontcolor=0x22c55e:x=3*w/4-10:y=(h-text_h)/2:alpha='if(lt(t,4.5),0,if(lt(t,5.3),(t-4.5)/0.8,1))',
      drawtext=text='ML Models':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=18:fontcolor=0x94a3b8:x=3*w/4-55:y=(h-text_h)/2+60:alpha='if(lt(t,5),0,if(lt(t,5.8),(t-5)/0.8,1))',
      drawtext=text='Built-in':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=18:fontcolor=0x94a3b8:x=3*w/4-35:y=(h-text_h)/2+85:alpha='if(lt(t,5),0,if(lt(t,5.8),(t-5)/0.8,1))'
    [vai];

    [results]
      drawtext=text='PROVEN RESULTS':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=18:fontcolor=0xfbbf24:x=(w-text_w)/2:y=(h-text_h)/2-180:alpha='if(lt(t,0.8),t/0.8,1)',
      drawtext=text='Colleges Using EduNexus Report':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=40:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-110:alpha='if(lt(t,1.5),0,if(lt(t,2.3),(t-1.5)/0.8,1))',
      drawtext=text='✓  40+ hours saved per staff per month':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=0x22c55e:x=(w-text_w)/2:y=(h-text_h)/2-20:alpha='if(lt(t,2.5),0,if(lt(t,3.3),(t-2.5)/0.8,1))',
      drawtext=text='✓  20% improvement in fee collection':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=0x22c55e:x=(w-text_w)/2:y=(h-text_h)/2+25:alpha='if(lt(t,3.5),0,if(lt(t,4.3),(t-3.5)/0.8,1))',
      drawtext=text='✓  25% increase in placement rates':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=0x22c55e:x=(w-text_w)/2:y=(h-text_h)/2+70:alpha='if(lt(t,4.5),0,if(lt(t,5.3),(t-4.5)/0.8,1))',
      drawtext=text='✓  60% more parent engagement':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=0x22c55e:x=(w-text_w)/2:y=(h-text_h)/2+115:alpha='if(lt(t,5.5),0,if(lt(t,6.3),(t-5.5)/0.8,1))',
      drawtext=text='✓  40% reduction in student dropouts':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=0x22c55e:x=(w-text_w)/2:y=(h-text_h)/2+160:alpha='if(lt(t,6.5),0,if(lt(t,7.3),(t-6.5)/0.8,1))'
    [vresults];

    [cta]
      drawtext=text='Ready to Transform':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=52:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-100:alpha='if(lt(t,0.8),t/0.8,1)',
      drawtext=text='Your College?':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=52:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-30:alpha='if(lt(t,1.5),0,if(lt(t,2.3),(t-1.5)/0.8,1))',
      drawtext=text='Schedule a Personalized Demo':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=28:fontcolor=0x93c5fd:x=(w-text_w)/2:y=(h-text_h)/2+60:alpha='if(lt(t,2.5),0,if(lt(t,3.3),(t-2.5)/0.8,1))',
      drawtext=text='sales@edu-nexus.co.in':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=32:fontcolor=0x22c55e:x=(w-text_w)/2:y=(h-text_h)/2+130:alpha='if(lt(t,3.5),0,if(lt(t,4.3),(t-3.5)/0.8,1))',
      drawtext=text='edu-nexus.co.in':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+180:alpha='if(lt(t,4.5),0,if(lt(t,5.3),(t-4.5)/0.8,1))',
      drawtext=text='Powered by Quantumlayer Platform':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=14:fontcolor=0x64748b:x=(w-text_w)/2:y=(h-text_h)/2+230:alpha='if(lt(t,5.5),0,if(lt(t,6.3),(t-5.5)/0.8,1))'
    [vcta];

    [vintro][vproblem]xfade=transition=fade:duration=1:offset=5[x0];
    [x0][vsolution]xfade=transition=fade:duration=1:offset=16[x1];
    [x1][v0]xfade=transition=fade:duration=0.8:offset=21[x2];
    [x2][v1]xfade=transition=slideleft:duration=0.6:offset=26.2[x3];
    [x3][v2]xfade=transition=slideleft:duration=0.6:offset=32.6[x4];
    [x4][v3]xfade=transition=slideleft:duration=0.6:offset=39[x5];
    [x5][v4]xfade=transition=slideleft:duration=0.6:offset=44.4[x6];
    [x6][v5]xfade=transition=slideleft:duration=0.6:offset=49.8[x7];
    [x7][v6]xfade=transition=slideleft:duration=0.6:offset=55.2[x8];
    [x8][v7]xfade=transition=slideleft:duration=0.6:offset=59.6[x9];
    [x9][v8]xfade=transition=slideleft:duration=0.6:offset=66[x10];
    [x10][v9]xfade=transition=slideleft:duration=0.6:offset=71.4[x11];
    [x11][vai]xfade=transition=fade:duration=0.8:offset=75.8[x12];
    [x12][vresults]xfade=transition=fade:duration=0.8:offset=83[x13];
    [x13][vcta]xfade=transition=fade:duration=1:offset=90.2[vfinal];

    [10:a]afade=t=in:st=0:d=2,afade=t=out:st=94:d=3,volume=0.3[afinal]
  " \
  -map "[vfinal]" -map "[afinal]" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -t 98 \
  ../Edu-Nexus-Premium-Demo.mp4

echo ""
echo "=============================================="
echo "✓ Premium Video: ../Edu-Nexus-Premium-Demo.mp4"
echo "Duration: ~1:38"
echo "Resolution: 1920x1080 Full HD"
echo "Focus: Pain Points & Solutions (NO PRICING)"
echo "=============================================="
