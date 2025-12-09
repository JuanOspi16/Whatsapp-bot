import { get_schedules, get_appointments, update_state } from "../APIs/api_client.js";

function setTime(date, timeString){
    const time = new Date(date);
    const [hours, minutes] = timeString.split(':').map(Number);
    time.setHours(hours, minutes, 0, 0);
    return time;
}

function minutesDifference(date1, date2){
    return (date2 - date1) / (1000 * 60);
}

export async function get_intervals({today, date, total_minutes, employee_id, id}){
    let message;
    today = new Date();
    today.setMinutes(today.getMinutes() + 10);
    date = new Date(date);
    //console.log("TODAY", today);
    //onsole.log("DATE", date);
    const schedule = await get_schedules({id: employee_id, day: today.getDay()});
    //console.log(schedule);
    //console.log(today, date);
    if(schedule.start_time === schedule.end_time){
        message = `El empleado no tiene horario disponible ese día. Por favor selecciona otra fecha.`;
    }else{
        const appointments = await get_appointments({id: employee_id, today: today, day: date});
        message = `Los intervalos disponibles son:\n`;
        if(appointments.length === 0){
            message += `- De ${schedule.start_time} a ${schedule.end_time}\n`;
        }else{
            let start_time;
            let end_time;
            if(today.getTime() === date.getTime()){
                start_time = today;
                end_time = setTime(today, schedule.end_time);
            }else{
                start_time = setTime(date, schedule.start_time);
                end_time = setTime(date, schedule.end_time);
            }
            
            for (let i = 0; i <= appointments.length; i++){
                let difference;
                let appointment_start, appointment_end;
                console.log("APPOINTMENTS:", appointments);
                if(i === 0){
                    appointment_start = start_time;
                    appointment_end = new Date(appointments[i].start_time);
                    difference = minutesDifference(appointment_start, appointment_end);
                }else if(i === appointments.length){
                    appointment_start = new Date(appointments[i-1].end_time);
                    appointment_end = end_time;
                    difference = minutesDifference(appointment_start, appointment_end);
                }else{
                    appointment_start = new Date(appointments[i-1].end_time);
                    appointment_end = new Date(appointments[i].start_time);
                    difference = minutesDifference(appointment_start, appointment_end);
                }
                //console.log(difference, parseInt(total_minutes.sum));
                if(difference >= parseInt(total_minutes.sum)){
                    message += `- De ${appointment_start.getHours().toString().padStart(2, '0')}:${appointment_start.getMinutes().toString().padStart(2, '0')} a ${appointment_end.getHours().toString().padStart(2, '0')}:${appointment_end.getMinutes().toString().padStart(2, '0')}\n`;
                }
            }

        }
        message += `Por favor selecciona una hora en formato HH:MM`;
    }
    
    //console.log(appointments);
    update_state({id: id, step: 4, employee_selected: employee_id, selected_date: date});
    return message;
}