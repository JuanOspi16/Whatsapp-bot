import { get_schedules, get_appointments, update_state } from "../APIs/api_client.js";

export async function get_intervals({today, date, total_minutes, employee_id, id}){
    let message;
    today = new Date();
    today.setMinutes(today.getMinutes() + 10);
    console.log("TODAY", today);
    console.log("DATE", date);
    const schedule = await get_schedules({id: employee_id, day: today.getDay()});
    console.log(schedule);
    //console.log(today, date);
    if(schedule.start_time === schedule.end_time){
        message = `El empleado no tiene horario disponible ese día. Por favor selecciona otra fecha.`;
    }else{
        const appointments = await get_appointments({id: employee_id, today: today, day: date});
        message = `Los intervalos disponibles son:\n`;
        if(appointments.length === 0){
            message += `- De ${schedule.start_time} a ${schedule.end_time}\n`;
        }else{
            


        }
        message += `Por favor selecciona una hora en formato HH:MM`;
    }
    
    //console.log(appointments);
    update_state({id: id, step: 4, employee_selected: employee_id, selected_date: date});
    return message;
}