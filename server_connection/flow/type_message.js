export async function type_message({type, message, options, client}) {
    //Type 0: text message
    //Type 1: button message
    let buttons = [];

    if (type === 0){
        return {
            messaging_product: "whatsapp",
            to: client,
            text: { body: message },
        }
    }else{
        buttons = options.map((opt, index) => ({
            type: "reply",
            reply: {
                id: opt.id,
                title: opt.title
            }
        }));

        return {
            messaging_product: "whatsapp",
            to: client,
            type: "interactive",
            interactive: {
                type: "button",
                body: { text: message },
                action: {
                    buttons: buttons
                }
            }
        }
    }
};