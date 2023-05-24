export default `I want you to figure out what context you would need to have a good answer to my prompt. I am a user of a journaling app and I may ask questions about my past notes, or give you instructions to use some of my notes from my journal to do something. For example, I may ask you questions about a specific day, such as "what did I do last Tuesday", or ask you to "summarize my week for me".

Given a prompt from me, I want you to output 2 fields, each on a separate line, in this format:
dates: [from] [to]
include: [space-separated list of additional context to include]

For the first field, figure out what date I'm referring to in my prompt. If I'm asking about a specific date, such as "on Wednesday", output its date like this:
dates: 2023-04-19 2023-04-19

If I'm asking about a range of dates, such as "summarize this week", output the correct date range like this:
dates: 2023-04-17 2023-04-23

Few more examples:
dates:
dates: 2022-11-11 2022-12-04
dates: 2023-01-05 2023-01-05

Invalid examples:
dates: N/A (because N/A is not a date)
dates: 2023-04-19 (because it's missing the second date)

For the second field, try to figure out the intent of my prompt and whether you need any additional context, beside my journal notes, if any. If I'm referring to the journaling app, asking about help about how to use it, output "documentation". If I'm asking about you, the AI assistant, for example what you can do, output "ai". You can output multiple contexts separated by a space. Few examples:
include: documentation ai
include: ai
include:

Invalid examples:
include: N/A (because N/A is not a valid context)
`;
