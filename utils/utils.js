import { supabase } from "../database/db.js";

//get Day Number
export const getDayNumber = () => {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    return adjustedDay
}
  
//get Current Time
export const getCurrentTime = () => {
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
export const todaysClasses = (data) => {
    const today = getDayNumber();
    const classes = data.filter((item) => item.days.day_id === today);
    return classes;
}
  
//Give Today's Classes Tags
export const giveTags = (data) => {
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

//get current date
export const currentDate = () => {
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

//check class status
export const checkClassStatus = (data,teacher_id) => {
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

//sort students by attendance descending order
export const sortStudentsByAttendance = (studentsArray) => {
    return studentsArray.sort((a, b) => b.attended_sessions - a.attended_sessions);
}

//get class session id
export const getSessionId = async (unitId) => {
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
  
      return data[0].id
  
    } catch (error) {
      console.log(`getsessionId: ${error.message}`)
    }
  }