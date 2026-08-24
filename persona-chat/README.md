The persona chat question type lets an AI play a character and hold a short, focused conversation with the student. Instead of writing one static answer, the student talks their way through a scenario: the character asks follow-up questions, pushes back on vague answers, and adapts to what the student says. The full transcript is graded afterwards.

The difference with a plain chat assessment is the *persona*. You pick who the AI is - a Socratic tutor, a customer at a service desk, a patient, a debater, a curious novice who needs everything explained - and that choice determines how the conversation feels and what it actually tests. A knowledge examiner tests understanding; a customer tests whether the student can handle a real conversation with someone who does not co-operate.

## When to use it

- Oral-exam-style assessment of a concept, without scheduling individual orals.
- Professional role play: customer contact, intake conversations, helpdesk calls, client briefings.
- Language practice, where the conversation itself is the skill being assessed.
- Probing reasoning: "explain why", "what would happen if", "defend your position".
- Teach-back: the student explains the material to a character who knows nothing about it.

## How it works for students

The student sees the question prompt and a chat window. They type messages and the character replies, guided by the persona and by the instructions you configure. The conversation ends when the completion criteria are met or when the message budget runs out - the character always finishes with a closing message, never with a question the student can no longer answer. Students should expect to spend around 10 minutes on a persona chat question.

## Settings

| Setting | Description |
| --- | --- |
| Persona | The character the AI plays. Each persona has its own system prompt describing how it behaves in conversation. |
| Instructions | The scenario *and* the completion criteria, in one field. Read by the character, never shown to the student. |
| AI starts | Whether the character sends the first message, or waits for the student to open the conversation. |
| Max turns | The maximum number of messages the character may send before the conversation is closed (default 10). |

### Writing good instructions

The instructions field does two jobs, and it needs to do both:

1. **The scenario** - the situation, the subject matter, and what the character should get the student to do.
2. **The completion criteria** - what the student has to have demonstrated before the conversation may end. A `<ul>` list of concrete, checkable criteria works best.

Keep the criteria achievable within the message budget: roughly one criterion per two messages. If you have started writing and want help finishing, use the **Improve with AI** button next to the field - it completes your draft into a full scenario plus criteria, in your own words and language.

## Grading

The full transcript is graded by AI against your scoring criteria. Only the student's messages count, and the grader takes the course of the conversation into account: an answer that only came after heavy prompting is worth less than one the student gave unprompted. You review the suggested scores and can adjust them, as with any AI-graded question.
