import logging

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.ai.advisor_agent.runner import run_agent
from app.ai.advisor_agent.schema import ChatRequest
from app.ai.speech_text.ellevenlabs import convert_speech_to_text
from app.api.deps import CurrentUser

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/advisor", tags=["advisor"])


@router.post("/chat")
async def chat(body: ChatRequest, current_user: CurrentUser) -> dict:
    """Send a message to the budget advisor agent.

    Returns { text, chart } where chart is null when the response has no visual data.
    """
    try:
        context = {"user_id": str(current_user.id)}
        return run_agent(body.message, context)
    except ValueError as e:
        logger.warning("Bad request to advisor from user %s: %s", current_user.id, e)
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.exception("Advisor agent error for user %s", current_user.id)
        raise HTTPException(
            status_code=500,
            detail="The advisor encountered an error. Please try again.",
        ) from e

@router.post("/speech-to-text") 
def speech_to_text(audio_file: UploadFile = File(...)):
    print("Speech to text conversion called")
    try:
        transcription = convert_speech_to_text(audio_file.file)
        return {"transcription": transcription}
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Speech to text conversion failed: {str(e)}",
        ) 