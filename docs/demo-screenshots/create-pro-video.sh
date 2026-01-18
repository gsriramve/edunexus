#!/bin/bash

# Edu-Nexus Professional Marketing Video
# CMO/UI-UX Design Principles: Minimal, Clean, Cinematic

/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg -y \
  -loop 1 -t 5 -i 01-landing.png \
  -loop 1 -t 6 -i 07-admin-dashboard.png \
  -loop 1 -t 6 -i 06-hod-dashboard.png \
  -loop 1 -t 6 -i 10-student-dashboard.png \
  -loop 1 -t 5 -i 12-alumni-dashboard.png \
  -i bgmusic.mp3 \
  -filter_complex "
    color=c=0x0f0f0f:s=1920x1080:d=4:r=30[intro];
    color=c=0x0f0f0f:s=1920x1080:d=5:r=30[outro];

    [intro]
      drawtext=text='edu-nexus':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-30:alpha='if(lt(t,0.8),t/0.8,1)',
      drawtext=text='_______________':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x3b82f6:x=(w-text_w)/2:y=(h-text_h)/2+30:alpha='if(lt(t,1.2),0,if(lt(t,1.8),(t-1.2)/0.6,1))',
      drawtext=text='AI-Powered College Management':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0x94a3b8:x=(w-text_w)/2:y=(h-text_h)/2+70:alpha='if(lt(t,1.5),0,if(lt(t,2.2),(t-1.5)/0.7,1))'
    [vintro];

    [0:v]scale=2400:-1,zoompan=z='1.15-on*0.0005':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x000000@0.5:t=fill,
      drawtext=text='Complete visibility across every role':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=white:x=(w-text_w)/2:y=h-52:alpha='if(lt(t,1),t,1)'
    [v0];

    [1:v]scale=2400:-1,zoompan=z='1.12-on*0.0004':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x000000@0.5:t=fill,
      drawtext=text='Admin':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x3b82f6:x=60:y=h-55:alpha='if(lt(t,0.5),t*2,1)',
      drawtext=text='Real-time fee tracking with AI predictions':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=26:fontcolor=white:x=150:y=h-55:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v1];

    [2:v]scale=2400:-1,zoompan=z='1.12-on*0.0004':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x000000@0.5:t=fill,
      drawtext=text='HOD':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x3b82f6:x=60:y=h-55:alpha='if(lt(t,0.5),t*2,1)',
      drawtext=text='AI identifies at-risk students early':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=26:fontcolor=white:x=130:y=h-55:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v2];

    [3:v]scale=2400:-1,zoompan=z='1.12-on*0.0004':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x000000@0.5:t=fill,
      drawtext=text='Student':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x3b82f6:x=60:y=h-55:alpha='if(lt(t,0.5),t*2,1)',
      drawtext=text='AI Career Advisor for smarter choices':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=26:fontcolor=white:x=170:y=h-55:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v3];

    [4:v]scale=2400:-1,zoompan=z='1.12-on*0.0004':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-80:w=iw:h=80:color=0x000000@0.5:t=fill,
      drawtext=text='Alumni':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x3b82f6:x=60:y=h-55:alpha='if(lt(t,0.5),t*2,1)',
      drawtext=text='AI-matched mentorship connections':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=26:fontcolor=white:x=160:y=h-55:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v4];

    [outro]
      drawtext=text='edu-nexus':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=64:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-60:alpha='if(lt(t,0.6),t/0.6,1)',
      drawtext=text='One platform. Total control.':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=28:fontcolor=0x94a3b8:x=(w-text_w)/2:y=(h-text_h)/2+10:alpha='if(lt(t,1.2),0,if(lt(t,1.8),(t-1.2)/0.6,1))',
      drawtext=text='edu-nexus.co.in':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=0x3b82f6:x=(w-text_w)/2:y=(h-text_h)/2+60:alpha='if(lt(t,2),0,if(lt(t,2.5),(t-2)/0.5,1))'
    [voutro];

    [vintro][v0]xfade=transition=fade:duration=0.8:offset=3.2[x0];
    [x0][v1]xfade=transition=fade:duration=0.6:offset=7.4[x1];
    [x1][v2]xfade=transition=fade:duration=0.6:offset=12.8[x2];
    [x2][v3]xfade=transition=fade:duration=0.6:offset=18.2[x3];
    [x3][v4]xfade=transition=fade:duration=0.6:offset=23.6[x4];
    [x4][voutro]xfade=transition=fade:duration=0.8:offset=28[vfinal];

    [5:a]afade=t=in:st=0:d=2,afade=t=out:st=30:d=3,volume=0.35[afinal]
  " \
  -map "[vfinal]" -map "[afinal]" \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -t 34 \
  ../Edu-Nexus-Pro.mp4

echo "✅ Professional Demo: ../Edu-Nexus-Pro.mp4"
