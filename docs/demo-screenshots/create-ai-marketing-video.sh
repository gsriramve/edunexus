#!/bin/bash

# EduNexus AI-Powered Marketing Demo - CMO Quality
# Features: Gradient overlays, AI messaging, dynamic Ken Burns, modern typography

/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg -y \
  -loop 1 -t 6 -i 01-landing.png \
  -loop 1 -t 5 -i 04-principal-dashboard.png \
  -loop 1 -t 4 -i 05-principal-departments.png \
  -loop 1 -t 5 -i 06-hod-dashboard.png \
  -loop 1 -t 4 -i 07-admin-dashboard.png \
  -loop 1 -t 4 -i 08-teacher-dashboard.png \
  -loop 1 -t 4 -i 09-lab-assistant-dashboard.png \
  -loop 1 -t 5 -i 10-student-dashboard.png \
  -loop 1 -t 4 -i 11-parent-dashboard.png \
  -loop 1 -t 5 -i 12-alumni-dashboard.png \
  -i bgmusic.mp3 \
  -filter_complex "
    color=c=0x0a0a1a:s=1920x1080:d=4:r=30[intro_bg];
    color=c=0x0a0a1a:s=1920x1080:d=5:r=30[outro_bg];

    [intro_bg]drawtext=text='EduNexus':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=100:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-80:alpha='if(lt(t,0.8),t/0.8,1)':shadowcolor=0x6366f1:shadowx=0:shadowy=0,
      drawtext=text='AI-Powered Education Platform':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=0x818cf8:x=(w-text_w)/2:y=(h-text_h)/2+20:alpha='if(lt(t,1.2),0,if(lt(t,2),(t-1.2)/0.8,1))',
      drawtext=text='Predictive Analytics • Smart Insights • Future Ready':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x22d3ee:x=(w-text_w)/2:y=(h-text_h)/2+80:alpha='if(lt(t,2),0,if(lt(t,2.8),(t-2)/0.8,1))'
      [vintro];

    [0:v]scale=2200:-1,zoompan=z='min(zoom+0.0006,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-180:w=iw:h=180:color=0x0a0a1a@0.7:t=fill,
      drawtext=text='One Platform':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=56:fontcolor=white:x=80:y=h-140:alpha='if(lt(t,0.5),t*2,1)',
      drawtext=text='Infinite Possibilities':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=56:fontcolor=0x22d3ee:x=80:y=h-80:alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)*2,1))'
      [v0];

    [1:v]scale=2200:-1,zoompan=z='1.15':x='iw/2-(iw/zoom/2)+sin(on/60)*30':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=500:h=ih:color=0x0a0a1a@0.6:t=fill,
      drawtext=text='PRINCIPAL':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=48:fontcolor=white:x=60:y=80:alpha='if(lt(t,0.3),t*3,1)',
      drawtext=text='━━━━━━━━━━':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x6366f1:x=60:y=140:alpha='if(lt(t,0.5),0,1)',
      drawtext=text='AI predicts student':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0xa5b4fc:x=60:y=200:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))',
      drawtext=text='success rates':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0xa5b4fc:x=60:y=240:alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)*2,1))',
      drawtext=text='► Real-time Analytics':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=22:fontcolor=0x22d3ee:x=60:y=320:alpha='if(lt(t,1.5),0,if(lt(t,2),(t-1.5)*2,1))',
      drawtext=text='► Performance Tracking':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=22:fontcolor=0x22d3ee:x=60:y=360:alpha='if(lt(t,1.8),0,if(lt(t,2.3),(t-1.8)*2,1))'
      [v1];

    [2:v]scale=2200:-1,zoompan=z='zoom+0.001':x='0':y='ih/2-(ih/zoom/2)':d=120:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-120:w=iw:h=120:color=0x0a0a1a@0.8:t=fill,
      drawtext=text='Department Overview • AI-Powered Resource Allocation':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=32:fontcolor=white:x=60:y=h-80:alpha='if(lt(t,0.5),t*2,1)'
      [v2];

    [3:v]scale=2200:-1,zoompan=z='min(zoom+0.0008,1.18)':x='iw/2-(iw/zoom/2)':y='ih/3':d=150:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=500:h=ih:color=0x0a0a1a@0.6:t=fill,
      drawtext=text='HOD':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=48:fontcolor=white:x=60:y=80:alpha='if(lt(t,0.3),t*3,1)',
      drawtext=text='━━━━━━━━━━':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x6366f1:x=60:y=140:alpha='if(lt(t,0.5),0,1)',
      drawtext=text='AI identifies':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0xa5b4fc:x=60:y=200:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))',
      drawtext=text='at-risk students':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0xa5b4fc:x=60:y=240:alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)*2,1))',
      drawtext=text='► Skill Gap Analysis':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=22:fontcolor=0x22d3ee:x=60:y=320:alpha='if(lt(t,1.5),0,if(lt(t,2),(t-1.5)*2,1))',
      drawtext=text='► Early Intervention Alerts':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=22:fontcolor=0x22d3ee:x=60:y=360:alpha='if(lt(t,1.8),0,if(lt(t,2.3),(t-1.8)*2,1))'
      [v3];

    [4:v]scale=2200:-1,zoompan=z='1.12':x='iw/2-(iw/zoom/2)-in_time*4':y='ih/2-(ih/zoom/2)':d=120:s=1920x1080:fps=30,
      drawbox=x=iw-450:y=0:w=450:h=ih:color=0x0a0a1a@0.6:t=fill,
      drawtext=text='ADMIN':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=48:fontcolor=white:x=w-400:y=80:alpha='if(lt(t,0.3),t*3,1)',
      drawtext=text='━━━━━━━━━━':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x6366f1:x=w-400:y=140:alpha='if(lt(t,0.5),0,1)',
      drawtext=text='Smart fee':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0xa5b4fc:x=w-400:y=200:alpha='if(lt(t,0.8),0,1)',
      drawtext=text='predictions':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0xa5b4fc:x=w-400:y=240:alpha='if(lt(t,1),0,1)',
      drawtext=text='► Collection Forecasts':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=22:fontcolor=0x22d3ee:x=w-400:y=320:alpha='if(lt(t,1.5),0,1)'
      [v4];

    [5:v]scale=2200:-1,zoompan=z='min(zoom+0.001,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-140:w=iw:h=140:color=0x0a0a1a@0.8:t=fill,
      drawtext=text='TEACHER':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=40:fontcolor=white:x=60:y=h-110:alpha='if(lt(t,0.3),t*3,1)',
      drawtext=text='AI suggests personalized learning paths':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0x22d3ee:x=60:y=h-60:alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)*2,1))'
      [v5];

    [6:v]scale=2200:-1,zoompan=z='1.12':x='iw/2-(iw/zoom/2)+in_time*3':y='ih/2-(ih/zoom/2)':d=120:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-140:w=iw:h=140:color=0x0a0a1a@0.8:t=fill,
      drawtext=text='LAB ASSISTANT':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=40:fontcolor=white:x=60:y=h-110:alpha='if(lt(t,0.3),t*3,1)',
      drawtext=text='Smart equipment tracking & maintenance alerts':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0x22d3ee:x=60:y=h-60:alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)*2,1))'
      [v6];

    [7:v]scale=2200:-1,zoompan=z='1.18-in_time*0.0015':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=520:h=ih:color=0x0a0a1a@0.6:t=fill,
      drawtext=text='STUDENT':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=48:fontcolor=white:x=60:y=80:alpha='if(lt(t,0.3),t*3,1)',
      drawtext=text='━━━━━━━━━━':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x6366f1:x=60:y=140:alpha='if(lt(t,0.5),0,1)',
      drawtext=text='AI Career Advisor':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0xa5b4fc:x=60:y=200:alpha='if(lt(t,0.8),0,1)',
      drawtext=text='predicts best-fit':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0xa5b4fc:x=60:y=240:alpha='if(lt(t,1),0,1)',
      drawtext=text='career paths':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0xa5b4fc:x=60:y=280:alpha='if(lt(t,1.2),0,1)',
      drawtext=text='► Digital ID Card':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=22:fontcolor=0x22d3ee:x=60:y=360:alpha='if(lt(t,1.8),0,1)',
      drawtext=text='► Progress Predictions':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=22:fontcolor=0x22d3ee:x=60:y=400:alpha='if(lt(t,2),0,1)'
      [v7];

    [8:v]scale=2200:-1,zoompan=z='min(zoom+0.0008,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=1920x1080:fps=30,
      drawbox=x=iw-480:y=0:w=480:h=ih:color=0x0a0a1a@0.6:t=fill,
      drawtext=text='PARENT':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=48:fontcolor=white:x=w-420:y=80:alpha='if(lt(t,0.3),t*3,1)',
      drawtext=text='━━━━━━━━━━':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x6366f1:x=w-420:y=140:alpha='if(lt(t,0.5),0,1)',
      drawtext=text='Stay informed with':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=26:fontcolor=0xa5b4fc:x=w-420:y=200:alpha='if(lt(t,0.8),0,1)',
      drawtext=text='predictive insights':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=26:fontcolor=0xa5b4fc:x=w-420:y=240:alpha='if(lt(t,1),0,1)',
      drawtext=text='► Real-time Updates':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=22:fontcolor=0x22d3ee:x=w-420:y=320:alpha='if(lt(t,1.5),0,1)'
      [v8];

    [9:v]scale=2200:-1,zoompan=z='1.15':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)-in_time*2':d=150:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=500:h=ih:color=0x0a0a1a@0.6:t=fill,
      drawtext=text='ALUMNI':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=48:fontcolor=white:x=60:y=80:alpha='if(lt(t,0.3),t*3,1)',
      drawtext=text='━━━━━━━━━━':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x6366f1:x=60:y=140:alpha='if(lt(t,0.5),0,1)',
      drawtext=text='AI-matched':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0xa5b4fc:x=60:y=200:alpha='if(lt(t,0.8),0,1)',
      drawtext=text='mentorship pairing':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0xa5b4fc:x=60:y=240:alpha='if(lt(t,1),0,1)',
      drawtext=text='► Network & Mentor':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=22:fontcolor=0x22d3ee:x=60:y=320:alpha='if(lt(t,1.5),0,1)',
      drawtext=text='► AI Job Matching':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=22:fontcolor=0x22d3ee:x=60:y=360:alpha='if(lt(t,1.8),0,1)'
      [v9];

    [outro_bg]drawtext=text='EduNexus':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=80:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-100:alpha='if(lt(t,0.5),t*2,1)',
      drawtext=text='The Future of Education is Here':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=0x818cf8:x=(w-text_w)/2:y=(h-text_h)/2-20:alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)*2,1))',
      drawtext=text='━━━━━━━━━━━━━━━━━━━━':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x6366f1:x=(w-text_w)/2:y=(h-text_h)/2+30:alpha='if(lt(t,1.5),0,1)',
      drawtext=text='edu-nexus.co.in':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=32:fontcolor=0x22d3ee:x=(w-text_w)/2:y=(h-text_h)/2+80:alpha='if(lt(t,2),0,if(lt(t,2.5),(t-2)*2,1))',
      drawtext=text='Schedule a Demo Today':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0x4ade80:x=(w-text_w)/2:y=(h-text_h)/2+140:alpha='if(lt(t,2.5),0,if(lt(t,3),(t-2.5)*2,1))'
      [voutro];

    [vintro][v0]xfade=transition=fade:duration=0.8:offset=3.2[x0];
    [x0][v1]xfade=transition=slideleft:duration=0.6:offset=8.4[x1];
    [x1][v2]xfade=transition=fade:duration=0.5:offset=12.8[x2];
    [x2][v3]xfade=transition=slideleft:duration=0.6:offset=16.3[x3];
    [x3][v4]xfade=transition=slideright:duration=0.6:offset=20.7[x4];
    [x4][v5]xfade=transition=slideleft:duration=0.5:offset=24.1[x5];
    [x5][v6]xfade=transition=slideleft:duration=0.5:offset=27.6[x6];
    [x6][v7]xfade=transition=fade:duration=0.6:offset=31.1[x7];
    [x7][v8]xfade=transition=slideright:duration=0.5:offset=35.5[x8];
    [x8][v9]xfade=transition=slideleft:duration=0.6:offset=39[x9];
    [x9][voutro]xfade=transition=fade:duration=1:offset=43[vfinal];

    [10:a]afade=t=in:st=0:d=2,afade=t=out:st=46:d=4,volume=0.35[afinal]
  " \
  -map "[vfinal]" -map "[afinal]" \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -t 50 \
  ../EduNexus-AI-Marketing-Demo.mp4

echo "✅ AI Marketing Demo created: ../EduNexus-AI-Marketing-Demo.mp4"
