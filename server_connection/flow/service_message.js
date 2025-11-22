import { get_services, create_state } from "../APIs/api_client.js";

export async function service_message({message, employee_id, client_id, user_phone}) {
    const services = await get_services({client_id: client_id});

        if(services.length > 1) { //Multiple services
            
            message += `¿Qué servicio deseas?\n`;
            services.forEach((service, index) => {
                message += `${index + 1}. ${service.name}\n`;
            })

            create_state({user_phone, step: 1, employee_id, client_id: client_id});
        }

    return message;
};