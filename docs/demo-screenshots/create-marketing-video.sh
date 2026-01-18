#!/bin/bash

# Marketing Demo Video - CMO Quality
# Ken Burns effect + Text overlays + Professional pacing

/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg -y \
  -loop 1 -t 5 -i 01-landing.png \
  -loop 1 -t 4 -i 02-platform-owner-dashboard.png \
  -loop 1 -t 3 -i 03-platform-owner-colleges.png \
  -loop 1 -t 4 -i 04-principal-dashboard.png \
  -loop 1 -t 3 -i 05-principal-departments.png \
  -loop 1 -t 3.5 -i 06-hod-dashboard.png \
  -loop 1 -t 3.5 -i 07-admin-dashboard.png \
  -loop 1 -t 3.5 -i 08-teacher-dashboard.png \
  -loop 1 -t 3.5 -i 09-lab-assistant-dashboard.png \
  -loop 1 -t 4 -i 10-student-dashboard.png \
  -loop 1 -t 3.5 -i 11-parent-dashboard.png \
  -loop 1 -t 4 -i 12-alumni-dashboard.png \
  -i bgmusic.mp3 \
  -filter_complex "
    color=c=black:s=1920x1080:d=3:r=30[intro];
    color=c=black:s=1920x1080:d=4:r=30[outro];
    
    [0:v]scale=2200:-1,zoompan=z='min(zoom+0.0008,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,
      drawtext=text='One Platform':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-50:alpha='if(lt(t,1),0,if(lt(t,2),(t-1),1))':shadowcolor=black:shadowx=3:shadowy=3,
      drawtext=text='Nine Powerful Portals':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+50:alpha='if(lt(t,1.5),0,if(lt(t,2.5),(t-1.5),1))':shadowcolor=black:shadowx=2:shadowy=2
      [v0];
    
    [1:v]scale=2200:-1,zoompan=z='1.15':x='iw/2-(iw/zoom/2)+sin(on/80)*20':y='ih/2-(ih/zoom/2)':d=120:s=1920x1080:fps=30,
      drawtext=text='PLATFORM OWNER':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=white:x=100:y=h-100:alpha='if(lt(t,0.5),t*2,1)':box=1:boxcolor=black@0.6:boxborderw=10
      [v1];
    
    [2:v]scale=2200:-1,zoompan=z='zoom+0.001':x='iw/4':y='ih/2-(ih/zoom/2)':d=90:s=1920x1080:fps=30,
      drawtext=text='Manage All Colleges':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=32:fontcolor=white:x=100:y=h-100:alpha='if(lt(t,0.5),t*2,1)':box=1:boxcolor=black@0.6:boxborderw=10
      [v2];
    
    [3:v]scale=2200:-1,zoompan=z='1.15-in_time*0.001':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=1920x1080:fps=30,
      drawtext=text='PRINCIPAL':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=white:x=100:y=h-100:alpha='if(lt(t,0.5),t*2,1)':box=1:boxcolor=black@0.6:boxborderw=10
      [v3];
    
    [4:v]scale=2200:-1,zoompan=z='zoom+0.001':x='0':y='ih/2-(ih/zoom/2)':d=90:s=1920x1080:fps=30,
      drawtext=text='Department Overview':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=32:fontcolor=white:x=100:y=h-100:alpha='if(lt(t,0.5),t*2,1)':box=1:boxcolor=black@0.6:boxborderw=10
      [v4];
    
    [5:v]scale=2200:-1,zoompan=z='min(zoom+0.001,1.2)':x='iw/2-(iw/zoom/2)':y='ih/3':d=105:s=1920x1080:fps=30,
      drawtext=text='HOD':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=white:x=100:y=h-100:alpha='if(lt(t,0.5),t*2,1)':box=1:boxcolor=black@0.6:boxborderw=10,
      drawtext=text='AI-Powered Insights':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=cyan:x=100:y=h-55:alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)*2,1))':box=1:boxcolor=black@0.6:boxborderw=5
      [v5];
    
    [6:v]scale=2200:-1,zoompan=z='1.1':x='iw/2-(iw/zoom/2)-in_time*3':y='ih/2-(ih/zoom/2)':d=105:s=1920x1080:fps=30,
      drawtext=text='ADMIN STAFF':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=white:x=100:y=h-100:alpha='if(lt(t,0.5),t*2,1)':box=1:boxcolor=black@0.6:boxborderw=10
      [v6];
    
    [7:v]scale=2200:-1,zoompan=z='min(zoom+0.001,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=105:s=1920x1080:fps=30,
      drawtext=text='TEACHER':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=white:x=100:y=h-100:alpha='if(lt(t,0.5),t*2,1)':box=1:boxcolor=black@0.6:boxborderw=10
      [v7];
    
    [8:v]scale=2200:-1,zoompan=z='1.15':x='iw/2-(iw/zoom/2)+in_time*2':y='ih/2-(ih/zoom/2)':d=105:s=1920x1080:fps=30,
      drawtext=text='LAB ASSISTANT':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=white:x=100:y=h-100:alpha='if(lt(t,0.5),t*2,1)':box=1:boxcolor=black@0.6:boxborderw=10
      [v8];
    
    [9:v]scale=2200:-1,zoompan=z='1.2-in_time*0.002':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=1920x1080:fps=30,
      drawtext=text='STUDENT':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=white:x=100:y=h-100:alpha='if(lt(t,0.5),t*2,1)':box=1:boxcolor=black@0.6:boxborderw=10,
      drawtext=text='Career Insights • Digital ID':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=cyan:x=100:y=h-55:alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)*2,1))':box=1:boxcolor=black@0.6:boxborderw=5
      [v9];
    
    [10:v]scale=2200:-1,zoompan=z='min(zoom+0.001,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=105:s=1920x1080:fps=30,
      drawtext=text='PARENT':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=white:x=100:y=h-100:alpha='if(lt(t,0.5),t*2,1)':box=1:boxcolor=black@0.6:boxborderw=10,
      drawtext=text='Stay Connected':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=cyan:x=100:y=h-55:alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)*2,1))':box=1:boxcolor=black@0.6:boxborderw=5
      [v10];
    
    [11:v]scale=2200:-1,zoompan=z='1.15':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)-in_time*2':d=120:s=1920x1080:fps=30,
      drawtext=text='ALUMNI':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=white:x=100:y=h-100:alpha='if(lt(t,0.5),t*2,1)':box=1:boxcolor=black@0.6:boxborderw=10,
      drawtext=text='Network • Mentor • Contribute':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=24:fontcolor=cyan:x=100:y=h-55:alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)*2,1))':box=1:boxcolor=black@0.6:boxborderw=5
      [v11];
    
    [intro]drawtext=text='EduNexus':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=96:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,0.5),t*2,if(lt(t,2.5),1,(3-t)*2))':shadowcolor=black:shadowx=4:shadowy=4[vintro];
    
    [outro]drawtext=text='EduNexus':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-80:alpha='if(lt(t,0.5),t*2,1)':shadowcolor=black:shadowx=3:shadowy=3,
      drawtext=text='Empowering Education':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=48:fontcolor=cyan:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)*2,1))':shadowcolor=black:shadowx=2:shadowy=2,
      drawtext=text='edu-nexus.co.in':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+80:alpha='if(lt(t,1.5),0,if(lt(t,2),(t-1.5)*2,1))':shadowcolor=black:shadowx=2:shadowy=2
      [voutro];
    
    [vintro][v0]xfade=transition=fade:duration=0.5:offset=2.5[x0];
    [x0][v1]xfade=transition=slideleft:duration=0.5:offset=7[x1];
    [x1][v2]xfade=transition=fade:duration=0.4:offset=10.5[x2];
    [x2][v3]xfade=transition=slideleft:duration=0.5:offset=13[x3];
    [x3][v4]xfade=transition=fade:duration=0.4:offset=16.5[x4];
    [x4][v5]xfade=transition=slideleft:duration=0.5:offset=19[x5];
    [x5][v6]xfade=transition=slideleft:duration=0.5:offset=22[x6];
    [x6][v7]xfade=transition=slideleft:duration=0.5:offset=25[x7];
    [x7][v8]xfade=transition=slideleft:duration=0.5:offset=28[x8];
    [x8][v9]xfade=transition=slideleft:duration=0.5:offset=31[x9];
    [x9][v10]xfade=transition=slideleft:duration=0.5:offset=34.5[x10];
    [x10][v11]xfade=transition=slideleft:duration=0.5:offset=37.5[x11];
    [x11][voutro]xfade=transition=fade:duration=0.8:offset=41[vfinal];
    
    [12:a]afade=t=in:st=0:d=2,afade=t=out:st=43:d=4,volume=0.4[afinal]
  " \
  -map "[vfinal]" -map "[afinal]" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -t 48 \
  ../EduNexus-Marketing-Demo.mp4

