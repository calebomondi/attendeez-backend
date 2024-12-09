const express = require('express');
const cors = require('cors');
const {createClient} = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

//middleware
app.use(cors({
    origin: ['http://localhost:5173','https://attendeez-tutor.vercel.app','https://attendeez.vercel.app']
}))
app.use(express.json())

//initialize supabase client
const supabase = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

//home
app.get('/', async (req,res) => {
  res.json({data:'Hello Galaxy!'});
});

//timetable
app.get('/timetable', async (req,res) => {
    try {
        const {data} = await supabase
        .from('timetable')
        .select(`
            timetable_id,
            start_time,
            end_time,
            classroom_id,
            days (
              day_id,
              day_name
            ),
            units (
              unit_id,
              unit_name
            )
          `)
          .order('day_id', { ascending: true });

        console.log(`server-data-TT: ${data}`);

        res.json(data);

    } catch (error) {
        res.status(500).json({error: error.message});
        console.log(`server-error-TT: ${error}`);
    }
});

//progress
app.get('/progress', async (req,res) => {
  const user = req.query.user

  try {
    const {data, error} = await supabase
    .rpc('get_student_attendance', { p_student_id: user });

    if (error) throw error

    console.log(`server-data-progress: ${data}`);

    res.json(data);

  } catch (error) {
    res.status(500).json({error: error.message});
    console.log(`server-error-progress: ${error}`);
  }
});

/*
*CLASS ACTIVE STATUS
*/
//get Day Number
const getDayNumber = () => {
  const date = new Date();
  const dayOfWeek = date.getDay();
  const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  return adjustedDay
}

//get Current Time
const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
      timeZone: 'Africa/Nairobi',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
  });
}

//Filter To Get classes That Are On Today
const todaysClasses = (data) => {
  const today = getDayNumber();
  const classes = data.filter((item) => item.days.day_id === today);
  return classes;
}

//Give Today's Classes Tags
const giveTags = (data) => {
  const currentTime = getCurrentTime();
  console.log(`currentTime: ${currentTime}`)

  data.forEach(lesson => {
    if(currentTime >= lesson.start_time && currentTime < lesson.end_time){
      lesson.status = 1
      lesson.progress = 'ongoing'
    }  
    else if(currentTime > lesson.end_time) {
      lesson.status = 0
      lesson.progress = 'ended'
    }
    else if(currentTime < lesson.start_time) {
      lesson.status = 2
      lesson.progress = 'upcoming'
    }
  });

  return data
}

app.get('/class-status', async (req, res) => {
  try {
    const {data} = await supabase
    .from('timetable')
    .select(`
        timetable_id,
        start_time,
        end_time,
        classroom_id,
        days (
          day_id,
          day_name
        ),
        units (
          unit_id,
          unit_name
        )
      `)
    .order('day_id', { ascending: true });

    console.log(`server-data-TC: ${data}`);

    const filteredTable = todaysClasses(data);

    res.json(giveTags(filteredTable));

  } catch (error) {
    res.status(500).json({error: error.message});
    console.log(`server-error-TT: ${error}`);
  }
});

//get current date
const currentDate = () => {
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

app.get('/attended-today', async (req,res) => {
  try {
    const user = req.query.user;

    const today = currentDate();

    const {data} = await supabase
    .from('classsessions')
    .select(`
      attendance!inner (
        attended
      ),
      unit_id
    `)
    .eq('attendance.student_id', `${user}`)
    .eq('session_date', `${today}`);

    console.log(`session-data-AT: ${data}`)

    res.json(data);
  } catch (error) {
    res.status(500).json({error: error.message});
    console.log(`server-error-TT: ${error}`);
  }  
});

app.get('/student-info', async (req,res) => {
  const myEmail = req.query.email

  try {
    const { data, error } = await supabase
      .from('students')
      .select(`student_id, name, semester`)
      .eq('email', myEmail)
      .single();

    if (error) throw error;

    res.json(data);
    
  } catch(error) {
    res.status(500).json({error: error.message});
    console.log(`server-error-SI: ${error}`);
  }
})

app.post('/join-session', async (req,res) => {
  const {unitId, studentId} = req.query;

  const sessionId = await getSessionId(unitId)

  try {
    const {data, error} = await supabase
    .from('amattending')
    .insert([
      { 
        class_session_id : sessionId, 
        student_id : studentId, 
        started: true
      }
    ])
    .select()

    if (error) {
      console.log(`join-session: ${error}`)
      throw error
    }

    res.json({ 
      success: true, 
      message: `You Have Joined The Class at ${getCurrentTime()}`,
      data: data
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

app.get('/in-attendance', async (req,res) => {
  const {unitId,studentId} = req.query

  const sessionId = await getSessionId(unitId)
  console.log(`sessionId -> ${sessionId}`)

  if(sessionId == 0)
    return res.json({started: false});

  try {
    const { data, error } = await supabase
      .from('amattending')
      .select(`started`)
      .eq('class_session_id', sessionId)
      .eq('student_id',studentId)
      .limit(1);

      if (error) {
        console.log('inAttendance error!');
        throw error
      }

    res.json(data[0] || {started: false});

  } catch(error) {
    res.status(500).json({error: error.message});
    console.log(`server-error-SI: ${error.message}`);
  }
})

app.post('/upload-multiple', async (req,res) => {
  const unitId = req.query.unitId;
  const studentIds = req.query.students?.split(',') || [];
  console.log(`studentIds: ${studentIds}`)

  const sessionId = await getSessionId(unitId)

  let upload = []

  try {
    for(const id of studentIds) {
      const {data, error} = await supabase
      .from('attendance')
      .insert([
        { 
          class_session_id : sessionId, 
          student_id : `SCT221-${id}`, 
          attended: true
        }
      ])
      .select()

      if (error) {
        console.log(`upload student ${id}: ${error}`)
        throw error
      }

      upload.push(data[0].attended)
    }

    res.json({upload})

  } catch (error) {
    res.status(500).json({error: error.message});
    console.log(`server-error-UM: ${error}`);
  }
})

app.post('/upload-single', async (req,res) => {
  const {unitId, studentId} = req.query;

  const sessionId = await getSessionId(unitId)

  try {
    const {data, error} = await supabase
    .from('attendance')
    .insert([
      { 
        class_session_id : sessionId, 
        student_id : studentId, 
        attended: true
      }
    ])
    .select()

    if (error) {
      console.log(`join-session: ${error}`)
      throw error
    }

    res.json({ 
      success: true, 
      message: `${studentId} Added To Attendance List!`,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
})

// --- ATTENDEEZ TUTOR ENDPOINTS --- 

const checkClassStatus = (data,teacher_id) => {
  const currentTime = getCurrentTime();

  const myLesson = data.filter(lesson => lesson.teacher_id === teacher_id)

  myLesson.forEach(lesson => {
    if(currentTime >= lesson.start_time && currentTime < lesson.end_time){
      lesson.status = 1
      lesson.progress = 'ongoing'
    }  
    else if(currentTime > lesson.end_time) {
      lesson.status = 0
      lesson.progress = 'ended'
    }
    else if(currentTime < lesson.start_time) {
      lesson.status = 2
      lesson.progress = 'upcoming'
    }
  });

  return myLesson
}

const sortStudentsByAttendance = (studentsArray) => {
  return studentsArray.sort((a, b) => b.attended_sessions - a.attended_sessions);
}

app.get('/myclasses-today', async (req,res) => {
  try {
    const teacher_id = req.query.teacher_id

    const {data} = await supabase
    .from('timetable')
    .select(`
        timetable_id,
        start_time,
        end_time,
        classroom_id,
        days (
          day_id,
          day_name
        ),
        units (
          unit_id,
          unit_name
        ),
        teacher_id
      `)
    .order('day_id', { ascending: true });

    console.log(`server-data-mct: ${data}`);

    const filteredTable = todaysClasses(data);

    const my_classes_today = checkClassStatus(filteredTable,teacher_id)

    res.json(my_classes_today);

  } catch (error) {
    res.status(500).json({error: error.message});
    console.log(`server-error-TT: ${error}`);
  }
})

app.get('/attendance-stats', async (req,res) => {
  const unit_id = req.query.unit_id
  try {
    const { data, error } = await supabase
    .rpc('get_attendance_stats', { p_unit_id: unit_id })

    if(error) throw error

    console.log(`server-response-students: ${data}`)

    res.json(sortStudentsByAttendance(data))

  } catch(error) {
    res.status(500).json({error: error.message});
    console.log(`server-error-MCA: ${error}`);
  }
})

app.get('/attendance-summary', async (req,res) => {
  const unit_id = req.query.unit_id
  try {
    const { data, error } = await supabase
    .rpc('get_attendance_summary', { unit_id_param: unit_id });

    if (error) throw error

    console.log(`server-response-summary: ${data}`)

    res.json(data)

  } catch(error) {
    res.status(500).json({error: error.message});
    console.log(`server-error-MCA: ${error}`);
  }
})

app.get('/teacher-info', async (req,res) => {
  const myEmail = req.query.email

  try {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        teacher_id,
        name,
        email,
        units (
          unit_id,
          semester
        )
      `)
      .eq('email', myEmail)
      .single();

    if (error) throw error;

    res.json(data);
    
  } catch(error) {
    res.status(500).json({error: error.message});
    console.log(`server-error-TI: ${error}`);
  }
})

app.get('/confirmed-today', async (req,res) => {
  try {
    const unit_id = req.query.unit_id;

    const today = currentDate();

    const {data} = await supabase
    .from('classsessions')
    .select(`session_end`)
    .eq('unit_id', `${unit_id}`)
    .eq('session_date', `${today}`);

    console.log(`session-data-CT: ${data}`)

    res.json(data);
  } catch (error) {
    res.status(500).json({error: error.message});
    console.log(`server-error-CT: ${error}`);
  }  
})

app.post('/start-classsession', async (req,res) => {
  const {unitId} = req.query;

  try {
    const {data, error} = await supabase
    .from('classsessions')
    .insert([
      {
        unit_id : unitId, 
        session_date : currentDate(), 
        session_end : false, 
        end_time : null
      }
    ])
    .select()

    if (error) {
      console.log(`start-class: ${error}`)
      throw error
    }

    res.json({ 
      success: true, 
      message: `Class started successfully at ${getCurrentTime()}`,
      data: data
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

app.get('/active-session', async (req,res) => {
  const {unitId} = req.query;

  try {
    const {data, error} = await supabase
    .from('classsessions')
    .select(`session_end`)
    .eq('unit_id',unitId)
    .eq('session_date', currentDate());

    if (error) throw error

    res.json(data[0])

  } catch (error) {
    res.status(500).json({error: error.message});
  }
})

const getSessionId = async (unitId) => {
  try {
    const today = currentDate();

    const {data, error} = await supabase
    .from('classsessions')
    .select(`id`)
    .eq('unit_id', `${unitId}`)
    .eq('session_date', `${today}`)
    .limit(1);

    if (error) {
      console.log('getSessionId error!')
      throw error
    }

    if(data.length == 0) {
      console.log('No session found for this unit and date');
      return 0;
    }

    console.log(`session-data-CT-: ${data[0].id}`)

    return data[0].id

  } catch (error) {
    console.log(`getsessionId: ${error.message}`)
  }
}

app.put('/finish-classsession', async (req,res) => {
  const {unitId} = req.query;

  const sessionId = await getSessionId(unitId)

  try {
    const {data, error} = await supabase
    .from('classsessions')
    .update([
      {
        unit_id : unitId, 
        session_date : currentDate(), 
        session_end : true, 
        end_time : getCurrentTime()
      }
    ])
    .eq('id',sessionId)
    .select();

    if (error) throw error

    res.json({ 
      success: true,
      message: `Class Session Ended At ${getCurrentTime()}`,
      data: data
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

app.get('/end-before-time', async (req,res) => {
  const {unitId} = req.query

  try {
    const {data, error} = await supabase
    .from('classsessions')
    .select(`session_end`)
    .eq('unit_id',unitId)
    .eq('session_date', currentDate())

    if (error) throw error

    if(!data || data.length === 0 || data[0].end_time === null)
      return res.json({session_end:false});

    res.json(data[0])

  } catch (error) {
    res.status(500).json({error: error.message});
  }
})

app.get('/check-session-end', async (req,res) => {
  const {unitId} = req.query

  if (!unitId) {
    return res.status(400).json({ error: 'Unit ID is required' })
  }

  const _date = currentDate()
  console.log(`date --> ${_date}`)
    
  try {
    const {data, error} = await supabase
    .from('classsessions')
    .select(`end_time`)
    .eq('unit_id',unitId)
    .eq('session_date', _date);

    if (error) throw error

    if(!data || data.length === 0 || data[0].end_time === null)
      return res.json({end_time:'',session_end:false, date:_date})

    res.json({end_time:data[0].end_time, session_end:true, date:_date})
  } catch (error) {
    res.status(500).json({error: error.message});
  }
})

app.get('/session-started', async (req,res) => {
  const {unitId} = req.query;

  try {
    const {data, error} = await supabase
    .from('classsessions')
    .select(`id,session_end`)
    .eq('unit_id',unitId)
    .eq('session_date', currentDate());

    if (error) throw error

    if(!data || data.length === 0)
      return res.json({"id":0,"session_end":false})

    res.json({"id":data[0].id,"session_end":data[0].session_end})

  } catch (error) {
    res.status(500).json({error: error.message});
  }
})















//port
app.listen(port, () => {
    console.log(`Server Running On Port ${port}`);
})