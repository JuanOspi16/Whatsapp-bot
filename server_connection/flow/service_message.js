import { get_services, update_state } from "../APIs/api_client.js";

export async function service_message({message, employee_id, client_id, user_phone, state_id}) {
    const services = await get_services({client_id: client_id});

        if(services.length > 1) { //Multiple services
            
            message += `¿Qué servicio deseas?\n`;
            services.forEach((service, index) => {  //TODO: poner precios
                message += `${index + 1}. ${service.name}: $${service.price}\n`;
            })

            update_state({id: state_id, step: 1, employee_selected: employee_id});
        }else{
            message += `El servicio disponible es: ${services[0].name} por $${services[0].price}.\n`;
            //Continuar al siguiente paso directamente
            update_state({id: state_id, step: 2, employee_selected: employee_id});
        }

    return message;
};