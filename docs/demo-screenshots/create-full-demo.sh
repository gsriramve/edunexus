#!/bin/bash

# Edu-Nexus Full Marketing Demo Video
# Duration: ~2:40 (160 seconds)
# Resolution: 1920x1080 Full HD
# Includes: Hook, Pain Points, All 9 Portals, AI Features, ROI, CTA

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check for ffmpeg
FFMPEG="ffmpeg"
if command -v /opt/homebrew/opt/ffmpeg-full/bin/ffmpeg &> /dev/null; then
    FFMPEG="/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg"
fi

echo "Creating Edu-Nexus Full Demo Video..."
echo "Using FFmpeg: $FFMPEG"

# Scene durations (total ~160 seconds / 2:40)
# Intro: 5s
# Hook/Problem: 8s
# Landing: 5s
# 9 Portals: 8s each = 72s
# AI Features: 10s
# ROI/Stats: 8s
# Pricing: 6s
# CTA: 6s
# Outro: 5s
# Total: ~125s + transitions

$FFMPEG -y \
  -loop 1 -t 5 -i 01-landing.png \
  -loop 1 -t 8 -i 02-platform-owner-dashboard.png \
  -loop 1 -t 8 -i 04-principal-dashboard.png \
  -loop 1 -t 7 -i 06-hod-dashboard.png \
  -loop 1 -t 7 -i 07-admin-dashboard.png \
  -loop 1 -t 7 -i 08-teacher-dashboard.png \
  -loop 1 -t 6 -i 09-lab-assistant-dashboard.png \
  -loop 1 -t 8 -i 10-student-dashboard.png \
  -loop 1 -t 7 -i 11-parent-dashboard.png \
  -loop 1 -t 6 -i 12-alumni-dashboard.png \
  -i bgmusic.mp3 \
  -filter_complex "
    color=c=0x1e3a5f:s=1920x1080:d=5:r=30[intro];
    color=c=0x0f172a:s=1920x1080:d=10:r=30[problem];
    color=c=0x0f172a:s=1920x1080:d=8:r=30[aifeatures];
    color=c=0x0f172a:s=1920x1080:d=8:r=30[stats];
    color=c=0x1e40af:s=1920x1080:d=6:r=30[pricing];
    color=c=0x1e3a5f:s=1920x1080:d=6:r=30[outro];

    [intro]
      drawtext=text='edu-nexus':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=90:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-60:alpha='if(lt(t,1),t,1)',
      drawtext=text='AI-Powered College Management':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=32:fontcolor=0xdbeafe:x=(w-text_w)/2:y=(h-text_h)/2+30:alpha='if(lt(t,1.5),0,if(lt(t,2.3),(t-1.5)/0.8,1))',
      drawtext=text='Powered by Quantumlayer Platform':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=20:fontcolor=0x94a3b8:x=(w-text_w)/2:y=(h-text_h)/2+80:alpha='if(lt(t,2.5),0,if(lt(t,3.3),(t-2.5)/0.8,1))'
    [vintro];

    [problem]
      drawtext=text='Managing 5000+ Students':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-120:alpha='if(lt(t,0.8),t/0.8,1)',
      drawtext=text='with Spreadsheets?':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=60:fontcolor=0xfbbf24:x=(w-text_w)/2:y=(h-text_h)/2-40:alpha='if(lt(t,1.5),0,if(lt(t,2.3),(t-1.5)/0.8,1))',
      drawtext=text='40+ hrs/month wasted on manual work':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=28:fontcolor=0xef4444:x=(w-text_w)/2:y=(h-text_h)/2+60:alpha='if(lt(t,3),0,if(lt(t,3.8),(t-3)/0.8,1))',
      drawtext=text='At-risk students discovered too late':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=28:fontcolor=0xef4444:x=(w-text_w)/2:y=(h-text_h)/2+110:alpha='if(lt(t,4),0,if(lt(t,4.8),(t-4)/0.8,1))',
      drawtext=text='Fee collection chasing never ends':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=28:fontcolor=0xef4444:x=(w-text_w)/2:y=(h-text_h)/2+160:alpha='if(lt(t,5),0,if(lt(t,5.8),(t-5)/0.8,1))',
      drawtext=text='There is a better way...':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=36:fontcolor=0x22c55e:x=(w-text_w)/2:y=(h-text_h)/2+240:alpha='if(lt(t,7),0,if(lt(t,7.8),(t-7)/0.8,1))'
    [vproblem];

    [0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.06-on*0.0002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x0f172a@0.85:t=fill,
      drawtext=text='One Platform for Complete College Visibility':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=30:fontcolor=white:x=(w-text_w)/2:y=h-50:alpha='if(lt(t,0.8),t/0.8,1)'
    [v0];

    [1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.06-on*0.0002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=240:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=70:color=0x2563eb@0.9:t=fill,
      drawtext=text='PLATFORM OWNER':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=white:x=40:y=22:alpha='if(lt(t,0.5),t/0.5,1)',
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x0f172a@0.85:t=fill,
      drawtext=text='Multi-college management  |  Revenue tracking  |  Platform analytics':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=(w-text_w)/2:y=h-50:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v1];

    [2:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.06-on*0.0002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=240:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=70:color=0x4f46e5@0.9:t=fill,
      drawtext=text='PRINCIPAL':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=white:x=40:y=22:alpha='if(lt(t,0.5),t/0.5,1)',
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x0f172a@0.85:t=fill,
      drawtext=text='Executive dashboard  |  AI insights  |  AICTE compliance reports':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=(w-text_w)/2:y=h-50:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v2];

    [3:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.06-on*0.0002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=210:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=70:color=0x7c3aed@0.9:t=fill,
      drawtext=text='HOD':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=white:x=40:y=22:alpha='if(lt(t,0.5),t/0.5,1)',
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x0f172a@0.85:t=fill,
      drawtext=text='AI identifies at-risk students early  |  Faculty workload optimization':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=(w-text_w)/2:y=h-50:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v3];

    [4:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.06-on*0.0002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=210:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=70:color=0x059669@0.9:t=fill,
      drawtext=text='ADMIN STAFF':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=white:x=40:y=22:alpha='if(lt(t,0.5),t/0.5,1)',
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x0f172a@0.85:t=fill,
      drawtext=text='Fee collection  |  Automated receipts  |  Transport & hostel operations':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=(w-text_w)/2:y=h-50:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v4];

    [5:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.06-on*0.0002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=210:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=70:color=0xdc2626@0.9:t=fill,
      drawtext=text='TEACHER':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=white:x=40:y=22:alpha='if(lt(t,0.5),t/0.5,1)',
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x0f172a@0.85:t=fill,
      drawtext=text='Smart attendance  |  AI-powered assignment grading  |  Student insights':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=(w-text_w)/2:y=h-50:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v5];

    [6:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.06-on*0.0002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=70:color=0xf59e0b@0.9:t=fill,
      drawtext=text='LAB ASSISTANT':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=white:x=40:y=22:alpha='if(lt(t,0.5),t/0.5,1)',
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x0f172a@0.85:t=fill,
      drawtext=text='Lab attendance  |  Equipment tracking  |  Practical session management':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=(w-text_w)/2:y=h-50:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v6];

    [7:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.06-on*0.0002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=240:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=70:color=0x0ea5e9@0.9:t=fill,
      drawtext=text='STUDENT':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=white:x=40:y=22:alpha='if(lt(t,0.5),t/0.5,1)',
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x0f172a@0.85:t=fill,
      drawtext=text='AI Career Advisor  |  Placement prediction  |  Personalized learning':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=(w-text_w)/2:y=h-50:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v7];

    [8:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.06-on*0.0002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=210:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=70:color=0xec4899@0.9:t=fill,
      drawtext=text='PARENT':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=white:x=40:y=22:alpha='if(lt(t,0.5),t/0.5,1)',
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x0f172a@0.85:t=fill,
      drawtext=text='Real-time updates  |  Online fee payment  |  Live bus tracking':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=(w-text_w)/2:y=h-50:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v8];

    [9:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.06-on*0.0002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=70:color=0x6366f1@0.9:t=fill,
      drawtext=text='ALUMNI':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=white:x=40:y=22:alpha='if(lt(t,0.5),t/0.5,1)',
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x0f172a@0.85:t=fill,
      drawtext=text='AI-matched mentorship  |  Career networking  |  Give back programs':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=(w-text_w)/2:y=h-50:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v9];

    [aifeatures]
      drawtext=text='AI That Actually Works':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=56:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-140:alpha='if(lt(t,0.8),t/0.8,1)',
      drawtext=text='85%':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=72:fontcolor=0x22c55e:x=w/4-80:y=(h-text_h)/2:alpha='if(lt(t,1.5),0,if(lt(t,2.3),(t-1.5)/0.8,1))',
      drawtext=text='Prediction Accuracy':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=0x94a3b8:x=w/4-140:y=(h-text_h)/2+80:alpha='if(lt(t,2),0,if(lt(t,2.8),(t-2)/0.8,1))',
      drawtext=text='24/7':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=72:fontcolor=0x22c55e:x=w/2-50:y=(h-text_h)/2:alpha='if(lt(t,2.5),0,if(lt(t,3.3),(t-2.5)/0.8,1))',
      drawtext=text='AI Chatbot Support':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=0x94a3b8:x=w/2-120:y=(h-text_h)/2+80:alpha='if(lt(t,3),0,if(lt(t,3.8),(t-3)/0.8,1))',
      drawtext=text='6':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=72:fontcolor=0x22c55e:x=3*w/4-10:y=(h-text_h)/2:alpha='if(lt(t,3.5),0,if(lt(t,4.3),(t-3.5)/0.8,1))',
      drawtext=text='ML Models Built-in':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=0x94a3b8:x=3*w/4-110:y=(h-text_h)/2+80:alpha='if(lt(t,4),0,if(lt(t,4.8),(t-4)/0.8,1))'
    [vai];

    [stats]
      drawtext=text='Proven Results':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=56:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-180:alpha='if(lt(t,0.8),t/0.8,1)',
      drawtext=text='+20%':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=64:fontcolor=0x22c55e:x=w/4-60:y=(h-text_h)/2-60:alpha='if(lt(t,1.2),0,if(lt(t,2),(t-1.2)/0.8,1))',
      drawtext=text='Fee Collection':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=22:fontcolor=0x94a3b8:x=w/4-80:y=(h-text_h)/2+10:alpha='if(lt(t,1.5),0,if(lt(t,2.3),(t-1.5)/0.8,1))',
      drawtext=text='40+ hrs':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=64:fontcolor=0x22c55e:x=w/2-80:y=(h-text_h)/2-60:alpha='if(lt(t,2.2),0,if(lt(t,3),(t-2.2)/0.8,1))',
      drawtext=text='Saved Monthly':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=22:fontcolor=0x94a3b8:x=w/2-80:y=(h-text_h)/2+10:alpha='if(lt(t,2.5),0,if(lt(t,3.3),(t-2.5)/0.8,1))',
      drawtext=text='+25%':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=64:fontcolor=0x22c55e:x=3*w/4-50:y=(h-text_h)/2-60:alpha='if(lt(t,3.2),0,if(lt(t,4),(t-3.2)/0.8,1))',
      drawtext=text='Placement Rate':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=22:fontcolor=0x94a3b8:x=3*w/4-90:y=(h-text_h)/2+10:alpha='if(lt(t,3.5),0,if(lt(t,4.3),(t-3.5)/0.8,1))',
      drawtext=text='1,677% Typical ROI  |  Payback < 1 Month':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=28:fontcolor=0xfbbf24:x=(w-text_w)/2:y=(h-text_h)/2+120:alpha='if(lt(t,5),0,if(lt(t,5.8),(t-5)/0.8,1))'
    [vstats];

    [pricing]
      drawtext=text='Simple, Transparent Pricing':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-100:alpha='if(lt(t,0.8),t/0.8,1)',
      drawtext=text='Rs. 500':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=100:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,1.5),0,if(lt(t,2.3),(t-1.5)/0.8,1))',
      drawtext=text='per student / year':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=32:fontcolor=0xdbeafe:x=(w-text_w)/2:y=(h-text_h)/2+100:alpha='if(lt(t,2),0,if(lt(t,2.8),(t-2)/0.8,1))',
      drawtext=text='All 20+ modules included  |  No hidden costs  |  24/7 support':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=0x93c5fd:x=(w-text_w)/2:y=(h-text_h)/2+170:alpha='if(lt(t,3),0,if(lt(t,3.8),(t-3)/0.8,1))'
    [vpricing];

    [outro]
      drawtext=text='edu-nexus':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=80:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-80:alpha='if(lt(t,0.6),t/0.6,1)',
      drawtext=text='Stop Managing Chaos. Start Leading.':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=32:fontcolor=0xdbeafe:x=(w-text_w)/2:y=(h-text_h)/2+10:alpha='if(lt(t,1.2),0,if(lt(t,2),(t-1.2)/0.8,1))',
      drawtext=text='sales@edu-nexus.co.in':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=28:fontcolor=0x22c55e:x=(w-text_w)/2:y=(h-text_h)/2+80:alpha='if(lt(t,2),0,if(lt(t,2.8),(t-2)/0.8,1))',
      drawtext=text='edu-nexus.co.in':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=24:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+130:alpha='if(lt(t,2.5),0,if(lt(t,3.3),(t-2.5)/0.8,1))',
      drawtext=text='Powered by Quantumlayer Platform':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=16:fontcolor=0x94a3b8:x=(w-text_w)/2:y=(h-text_h)/2+180:alpha='if(lt(t,3),0,if(lt(t,3.8),(t-3)/0.8,1))'
    [voutro];

    [vintro][vproblem]xfade=transition=fade:duration=0.8:offset=4.2[x0];
    [x0][v0]xfade=transition=fade:duration=0.6:offset=13.4[x1];
    [x1][v1]xfade=transition=slideleft:duration=0.6:offset=17.8[x2];
    [x2][v2]xfade=transition=slideleft:duration=0.6:offset=25.2[x3];
    [x3][v3]xfade=transition=slideleft:duration=0.6:offset=32.6[x4];
    [x4][v4]xfade=transition=slideleft:duration=0.6:offset=39[x5];
    [x5][v5]xfade=transition=slideleft:duration=0.6:offset=45.4[x6];
    [x6][v6]xfade=transition=slideleft:duration=0.6:offset=51.8[x7];
    [x7][v7]xfade=transition=slideleft:duration=0.6:offset=57.2[x8];
    [x8][v8]xfade=transition=slideleft:duration=0.6:offset=64.6[x9];
    [x9][v9]xfade=transition=slideleft:duration=0.6:offset=71[x10];
    [x10][vai]xfade=transition=fade:duration=0.8:offset=76.2[x11];
    [x11][vstats]xfade=transition=fade:duration=0.8:offset=83.4[x12];
    [x12][vpricing]xfade=transition=fade:duration=0.8:offset=90.6[x13];
    [x13][voutro]xfade=transition=fade:duration=0.8:offset=95.8[vfinal];

    [10:a]afade=t=in:st=0:d=2,afade=t=out:st=98:d=3,volume=0.35[afinal]
  " \
  -map "[vfinal]" -map "[afinal]" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -t 102 \
  ../Edu-Nexus-Demo-Full.mp4

echo ""
echo "============================================"
echo "Video created: ../Edu-Nexus-Demo-Full.mp4"
echo "Duration: ~1:42"
echo "Resolution: 1920x1080 Full HD"
echo "============================================"
