#!/bin/bash

# Edu-Nexus Clean Professional Video
# NO stretching - proper letterbox
# HIGH contrast - white text only

/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg -y \
  -loop 1 -t 5 -i 01-landing.png \
  -loop 1 -t 6 -i 07-admin-dashboard.png \
  -loop 1 -t 6 -i 06-hod-dashboard.png \
  -loop 1 -t 6 -i 10-student-dashboard.png \
  -loop 1 -t 5 -i 12-alumni-dashboard.png \
  -i bgmusic.mp3 \
  -filter_complex "
    color=c=black:s=1920x1080:d=4:r=30[intro];
    color=c=black:s=1920x1080:d=5:r=30[outro];

    [intro]
      drawtext=text='edu-nexus':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=80:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-40:alpha='if(lt(t,0.8),t/0.8,1)',
      drawtext=text='AI-Powered College Management':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=32:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+50:alpha='if(lt(t,1.5),0,if(lt(t,2.2),(t-1.5)/0.7,1))'
    [vintro];

    [0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.08-on*0.0003':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-70:w=iw:h=70:color=black@0.6:t=fill,
      drawtext=text='One platform for complete college visibility':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=28:fontcolor=white:x=(w-text_w)/2:y=h-45:alpha='if(lt(t,1),t,1)'
    [v0];

    [1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.08-on*0.0003':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-70:w=iw:h=70:color=black@0.6:t=fill,
      drawtext=text='Admin  |  Real-time fee tracking with AI predictions':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=white:x=(w-text_w)/2:y=h-45:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v1];

    [2:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.08-on*0.0003':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-70:w=iw:h=70:color=black@0.6:t=fill,
      drawtext=text='HOD  |  AI identifies at-risk students early':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=white:x=(w-text_w)/2:y=h-45:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v2];

    [3:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.08-on*0.0003':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-70:w=iw:h=70:color=black@0.6:t=fill,
      drawtext=text='Student  |  AI Career Advisor for smarter choices':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=white:x=(w-text_w)/2:y=h-45:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v3];

    [4:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30,
      zoompan=z='1.08-on*0.0003':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,
      drawbox=x=0:y=ih-70:w=iw:h=70:color=black@0.6:t=fill,
      drawtext=text='Alumni  |  AI-matched mentorship connections':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=26:fontcolor=white:x=(w-text_w)/2:y=h-45:alpha='if(lt(t,0.8),0,if(lt(t,1.3),(t-0.8)*2,1))'
    [v4];

    [outro]
      drawtext=text='edu-nexus':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-50:alpha='if(lt(t,0.6),t/0.6,1)',
      drawtext=text='One platform. Total control.':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=32:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+30:alpha='if(lt(t,1.2),0,if(lt(t,1.8),(t-1.2)/0.6,1))',
      drawtext=text='edu-nexus.co.in':fontfile=/System/Library/Fonts/HelveticaNeue.ttc:fontsize=28:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+90:alpha='if(lt(t,2),0,if(lt(t,2.5),(t-2)/0.5,1))'
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
  ../Edu-Nexus-Clean.mp4

echo "✅ Clean Demo: ../Edu-Nexus-Clean.mp4"
