# **Documento de Requerimientos: Refactorización de Webhook por Cliente**

## **Contexto del Negocio**

**EmyFlow MCP** es una plataforma multi-tenant de automatización empresarial que orquesta comunicaciones mediante un servidor httpy y wassenger. La plataforma gestiona múltiples clientes (consultorios dentales) desde un panel administrativo centralizado, proporcionando herramientas de bufferización de mensajes.

### **Funcionamiento Actual**

El sistema actualmente utiliza una configuración global de webhook definida en el archivo `.env` mediante la variable `MAKE_AGENT_WEBHOOK_URL`.

**Limitación identificada**: Al tener un solo webhook global, todos los clientes comparten el mismo destino, lo que limita la flexibilidad para personalizar flujos de trabajo específicos por cliente y dificulta la separación de responsabilidades entre diferentes negocios.

***

## **Objetivo del Cambio**

Migrar de un **webhook global** a un **webhook individual por cliente**, permitiendo que cada cliente tenga su propio endpoint personalizado al cual se enviarán los mensajes.

Se debe de actualizar la base de datos para que cada cliente tenga su propio webhook, iniciará en null, pero no borres la data que ya hay.

Ejemplo de webhok proveniente de wassenger:
{
    "id": "ACB19255F805BFD6139C144316DE574F",
    "object": "message",
    "event": "message:in:new",
    "created": 1765642500,
    "device": {
        "id": "68fd1067b488de07029fccc2",
        "phone": "+5215645570796",
        "alias": "White-Dental",
        "plan": "io-professional"
    },
    "data": {
        "id": "ACB19255F805BFD6139C144316DE574F",
        "type": "text",
        "flow": "inbound",
        "status": "active",
        "ack": "delivered",
        "from": "5215617354008@c.us",
        "fromNumber": "+5215617354008",
        "to": "5215645570796@c.us",
        "toNumber": "+5215645570796",
        "date": "2025-12-13T16:15:00.000Z",
        "timestamp": 1765642500,
        "body": "El instrumental que tiene cinta rosita es de Romina (la hija del doc)",
        "chat": {
            "id": "5215617354008@c.us",
            "name": "Dra Reynita",
            "date": "2025-12-13T16:15:00.000Z",
            "type": "chat",
            "lid": "183807571451999@lid",
            "status": "pending",
            "waStatus": "active",
            "statusUpdatedAt": "2025-12-13T16:10:28.509Z",
            "statusUpdatedBy": null,
            "prevStatus": "pending",
            "prevStatusUpdatedAt": "2025-12-13T16:04:45.208Z",
            "firstMessageAt": "2025-11-01T19:29:32.000Z",
            "lastMessageAt": "2025-12-13T16:15:00.000Z",
            "lastMessageTime": 1765642500,
            "lastOutboundMessageAt": "2025-12-13T16:05:13.000Z",
            "lastInboundMessageAt": "2025-12-13T16:15:00.000Z",
            "lastAutoReply": null,
            "lastAutoReplyAt": null,
            "stats": {
                "notes": 0,
                "inboundMessages": 0,
                "outboundMessages": 0,
                "localMessages": 54
            },
            "labels": [
                "humano",
                "contacto"
            ],
            "owner": {
                "agent": null,
                "department": null,
                "previousDepartment": null,
                "departmentAssigner": null,
                "departmentUpdatedAt": null,
                "autoAssignDepartment": null,
                "autoAssignDepartmentAt": null
            },
            "contact": {
                "wid": "5215617354008@c.us",
                "type": "user",
                "name": "Dra Reynita",
                "shortName": "Dra",
                "displayName": "𝓡𝓮𝔂",
                "syncedAt": "2025-10-25T18:33:04.212Z",
                "phone": "+5215617354008",
                "image": {
                    "url": "https://pps.whatsapp.net/v/t61.24694-24/541025432_1892356191339485_6133995670062133382_n.jpg?ccb=11-4&oh=01_Q5Aa3QG13qn6UgY9pXu3PNOFCsUGiw3HkfPJKsZLwrzMyzcx3g&oe=6949BEA4&_nc_sid=5e03e0&_nc_cat=101"
                },
                "info": {
                    "languages": [],
                    "links": [],
                    "kind": "personal",
                    "fullName": null
                },
                "locationInfo": {
                    "alpha2": "MX",
                    "alpha3": "MEX",
                    "countryCallingCodes": [
                        "+52"
                    ],
                    "currencies": [
                        "MXN",
                        "MXV"
                    ],
                    "emoji": "🇲🇽",
                    "ioc": "MEX",
                    "languages": [
                        {
                            "code": "SPA",
                            "iso": "es",
                            "name": "Spanish",
                            "nativeName": "Español"
                        }
                    ],
                    "name": "Mexico",
                    "status": "assigned"
                },
                "metadata": [
                    {
                        "key": "capi_contacto_enviado",
                        "value": "true"
                    }
                ],
                "campaigns": [],
                "subscription": {
                    "status": "active",
                    "updatedAt": "2025-10-25T18:33:04.212Z"
                }
            },
            "links": {
                "chat": "/v1/chat/68fd1067b488de07029fccc2/chats/5215617354008@c.us",
                "messages": "/v1/chat/68fd1067b488de07029fccc2/messages?chat=5215617354008@c.us",
                "status": "/v1/chat/68fd1067b488de07029fccc2/status?chat=5215617354008@c.us",
                "contact": "/v1/chat/68fd1067b488de07029fccc2/contacts/5215617354008@c.us",
                "device": "/v1/devices/68fd1067b488de07029fccc2"
            }
        },
        "events": {},
        "meta": {
            "containsEmoji": false,
            "isBizNotification": false,
            "isBroadcast": false,
            "isChannel": false,
            "isDoc": false,
            "isEphemeral": false,
            "isFailed": false,
            "isForwarded": false,
            "isGif": false,
            "isGroup": false,
            "isLinkPreview": false,
            "isLive": false,
            "isNotification": false,
            "isPSA": false,
            "isRevoked": false,
            "isStar": false,
            "isUnreadType": false,
            "notifyName": "𝓡𝓮𝔂",
            "rtl": false,
            "source": "android",
            "isFirstMessage": false
        },
        "links": {
            "message": "/v1/chat/68fd1067b488de07029fccc2/messages/ACB19255F805BFD6139C144316DE574F",
            "chat": "/v1/chat/68fd1067b488de07029fccc2/chats/5215617354008@c.us",
            "contact": "/v1/chat/68fd1067b488de07029fccc2/contacts/5215617354008@c.us",
            "chatMessages": "/v1/chat/68fd1067b488de07029fccc2/messages?chat=5215617354008@c.us",
            "device": "/v1/devices/68fd1067b488de07029fccc2"
        }
    }
}

EN esencia, tiene que detectar a que cliente pertenece el mensaje y enviarlo al endpoint personalizado de cada cliente. Es MUY importante que utilices una buena gestión de base de datos, porque no quiero problemas de rendimiento en gran escala o que realentices los menajes, debe de ser rápido y eficiente.
