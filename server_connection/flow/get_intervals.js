import { get_schedules, get_appointments, update_state } from "../APIs/api_client.js";

export async function set_time(date, timeString){
    const time = new Date(date);
    const [hours, minutes] = timeString.split(':').map(Number);
    time.setHours(hours, minutes, 0, 0);
    return time;
}

function minutesDifference(date1, date2){
    return (date2 - date1) / (1000 * 60);
}

export async function get_intervals({today, date, total_minutes, employee_id}){
    let intervals = [];
    today = new Date();
    today.setMinutes(today.getMinutes() + 10);
    date = new Date(date);
    const final_date = await set_time(date, "23:59");
    const schedule = await get_schedules({id: employee_id, day: today.getDay()});
    const appointments = await get_appointments({id: employee_id, today: today, day: date, final_date: final_date});

    let start_time;
    let end_time;
    
    if(today.toISOString().split('T')[0] === date.toISOString().split('T')[0]){
        //Si la fecha es hoy
        start_time = today;
        end_time = await set_time(today, schedule.end_time);
    }else{
        //Si la fecha es diferente a hoy
        start_time = await set_time(date, schedule.start_time);
        end_time = await set_time(date, schedule.end_time);
    }
    
    if(appointments.length === 0){
        //No hay citas
        end_time.setMinutes(end_time.getMinutes() - total_minutes.sum);
        intervals.push({start: `${start_time.getHours().toString().padStart(2, '0')}:${start_time.getMinutes().toString().padStart(2, '0')}`, end: `${end_time.getHours().toString().padStart(2, '0')}:${end_time.getMinutes().toString().padStart(2, '0')}`});
    }else{
        for (let i = 0; i <= appointments.length; i++){
            let difference;
            let appointment_start, appointment_end;
            if(i === 0){
                //Intervalo desde el inicio del horario hasta la primera cita
                appointment_start = start_time;
                appointment_end = new Date(appointments[i].start_time);
                difference = minutesDifference(appointment_start, appointment_end);
            }else if(i === appointments.length){
                //Intervalo desde el final de la última cita hasta el final del horario
                appointment_start = new Date(appointments[i-1].end_time);
                appointment_end = end_time;
                difference = minutesDifference(appointment_start, appointment_end);
            }else{
                //Intervalo entre dos citas
                appointment_start = new Date(appointments[i-1].end_time);
                appointment_end = new Date(appointments[i].start_time);
                difference = minutesDifference(appointment_start, appointment_end);
            }
            
            if(difference >= parseInt(total_minutes.sum)){
                //Hay espacio para una cita
                appointment_end.setMinutes(appointment_end.getMinutes() - total_minutes.sum);
                intervals.push({start: `${appointment_start.getHours().toString().padStart(2, '0')}:${appointment_start.getMinutes().toString().padStart(2, '0')}`, 
                end: `${appointment_end.getHours().toString().padStart(2, '0')}:${appointment_end.getMinutes().toString().padStart(2, '0')}`});
            }
        }
    }
    return intervals;
}

export async function print_intervals({today, date, total_minutes, employee_id, id}){
    
    const intervals = await get_intervals({today: today, date: date, total_minutes: total_minutes, employee_id: employee_id});
    
    let message = ``;

    if(intervals.length === 0){
        message = `El empleado no tiene horario disponible ese día. Por favor selecciona otra fecha.`;
        update_state({id: id, step: 3, employee_selected: employee_id});
    }else{
        message = `Los intervalos disponibles son:\n`;
        for(let i = 0; i < intervals.length; i++){
            const start = intervals[i].start;
            const end = intervals[i].end;
            message += `- De ${start} a ${end}\n`;
        }
        update_state({id: id, step: 4, employee_selected: employee_id, selected_date: date});
    
    }
    //message += `Por favor selecciona una hora en formato HH:MM`;
    
    return message;
}