#!/bin/bash

# Edu-Nexus 30-Second Story Video
# Zoom-out Ken Burns effect, clean text, high contrast

/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg -y \
  -loop 1 -t 4 -i 01-landing.png \
  -loop 1 -t 6 -i 07-admin-dashboard.png \
  -loop 1 -t 6 -i 06-hod-dashboard.png \
  -loop 1 -t 6 -i 10-student-dashboard.png \
  -loop 1 -t 5 -i 12-alumni-dashboard.png \
  -i bgmusic.mp3 \
  -filter_complex "
    color=c=black:s=1920x1080:d=3:r=30[intro];
    color=c=black:s=1920x1080:d=4:r=30[outro];

    [intro]
      drawtext=text='Edu-Nexus':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=90:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-60:alpha='if(lt(t,0.5),t*2,1)',
      drawtext=text='Complete College Control':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=40:fontcolor=0x60a5fa:x=(w-text_w)/2:y=(h-text_h)/2+40:alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)*2,1))'
    [vintro];

    [0:v]scale=2400:-1,zoompan=z='1.25-on*0.0008':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-100:w=iw:h=100:color=black@0.7:t=fill,
      drawtext=text='One Platform. Every Role. Total Visibility.':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=white:x=(w-text_w)/2:y=h-65:alpha='if(lt(t,0.5),t*2,1)'
    [v0];

    [1:v]scale=2400:-1,zoompan=z='1.2-on*0.0006':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=90:color=black@0.8:t=fill,
      drawtext=text='ADMIN DASHBOARD':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=32:fontcolor=white:x=40:y=30:alpha='if(lt(t,0.3),t*3,1)',
      drawbox=x=0:y=ih-120:w=iw:h=120:color=black@0.7:t=fill,
      drawtext=text='Track fees, attendance, and records in real-time':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=30:fontcolor=white:x=40:y=h-90:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))',
      drawtext=text='Edu-Nexus AI predicts collection rates and flags anomalies':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=26:fontcolor=0x60a5fa:x=40:y=h-50:alpha='if(lt(t,1.5),0,if(lt(t,2),(t-1.5)*2,1))'
    [v1];

    [2:v]scale=2400:-1,zoompan=z='1.2-on*0.0006':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=90:color=black@0.8:t=fill,
      drawtext=text='HOD DASHBOARD':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=32:fontcolor=white:x=40:y=30:alpha='if(lt(t,0.3),t*3,1)',
      drawbox=x=0:y=ih-120:w=iw:h=120:color=black@0.7:t=fill,
      drawtext=text='Monitor faculty and student performance':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=30:fontcolor=white:x=40:y=h-90:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))',
      drawtext=text='Edu-Nexus AI identifies at-risk students before they fail':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=26:fontcolor=0x60a5fa:x=40:y=h-50:alpha='if(lt(t,1.5),0,if(lt(t,2),(t-1.5)*2,1))'
    [v2];

    [3:v]scale=2400:-1,zoompan=z='1.2-on*0.0006':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=90:color=black@0.8:t=fill,
      drawtext=text='STUDENT PORTAL':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=32:fontcolor=white:x=40:y=30:alpha='if(lt(t,0.3),t*3,1)',
      drawbox=x=0:y=ih-120:w=iw:h=120:color=black@0.7:t=fill,
      drawtext=text='Access grades, attendance, and digital ID':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=30:fontcolor=white:x=40:y=h-90:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))',
      drawtext=text='Edu-Nexus AI Career Advisor suggests best-fit paths':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=26:fontcolor=0x60a5fa:x=40:y=h-50:alpha='if(lt(t,1.5),0,if(lt(t,2),(t-1.5)*2,1))'
    [v3];

    [4:v]scale=2400:-1,zoompan=z='1.2-on*0.0006':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,
      drawbox=x=0:y=0:w=iw:h=90:color=black@0.8:t=fill,
      drawtext=text='ALUMNI NETWORK':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=32:fontcolor=white:x=40:y=30:alpha='if(lt(t,0.3),t*3,1)',
      drawbox=x=0:y=ih-120:w=iw:h=120:color=black@0.7:t=fill,
      drawtext=text='Connect graduates with current students':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=30:fontcolor=white:x=40:y=h-90:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))',
      drawtext=text='Edu-Nexus AI-matched mentorship and job opportunities':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=26:fontcolor=0x60a5fa:x=40:y=h-50:alpha='if(lt(t,1.5),0,if(lt(t,2),(t-1.5)*2,1))'
    [v4];

    [outro]
      drawtext=text='Edu-Nexus':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=80:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-80:alpha='if(lt(t,0.5),t*2,1)',
      drawtext=text='One Platform. Total Control.':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=0x60a5fa:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)*2,1))',
      drawtext=text='edu-nexus.co.in':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=32:fontcolor=0x4ade80:x=(w-text_w)/2:y=(h-text_h)/2+60:alpha='if(lt(t,1.5),0,if(lt(t,2),(t-1.5)*2,1))'
    [voutro];

    [vintro][v0]xfade=transition=fade:duration=0.5:offset=2.5[x0];
    [x0][v1]xfade=transition=slideleft:duration=0.5:offset=6[x1];
    [x1][v2]xfade=transition=slideleft:duration=0.5:offset=11.5[x2];
    [x2][v3]xfade=transition=slideleft:duration=0.5:offset=17[x3];
    [x3][v4]xfade=transition=slideleft:duration=0.5:offset=22.5[x4];
    [x4][voutro]xfade=transition=fade:duration=0.5:offset=27[vfinal];

    [5:a]afade=t=in:st=0:d=1.5,afade=t=out:st=29:d=3,volume=0.4[afinal]
  " \
  -map "[vfinal]" -map "[afinal]" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -t 32 \
  ../Edu-Nexus-Story-Demo.mp4

echo "✅ Edu-Nexus Story Demo created: ../Edu-Nexus-Story-Demo.mp4"
