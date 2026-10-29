from google.antigravity import Agent, LocalAgentConfig

def send_whatsapp_message(phone_number: str, message: str) -> str:
    """Sends a WhatsApp message to the given phone number.

    Args:
        phone_number: The phone number to send the message to.
        message: The content of the message.
    """
    print(f"Sending WhatsApp message to {phone_number}:\n{message}")
    return f"Successfully sent WhatsApp message to {phone_number}."

config = LocalAgentConfig(
    tools=[send_whatsapp_message],
    system_instructions=(
        "You are a Madrasha Management Assistant capable of notifying guardians "
        "about student attendance, fees, and other updates via WhatsApp. When asked "
        "to notify a guardian, always use the send_whatsapp_message tool to format "
        "and send the message appropriately."
    ),
)
