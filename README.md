## How does your system work? (if not addressed in comments in source)

I've set up a node express server.  So to run the build.sh node v8.12.0 must be installed and npm v6.4.1 or later.  It includes one endpoint which lives at `http://localhost:3000/`.  The endpoint includes a GET method to retrieve a line from a file stored on the server.  To use the GET method a `lineNumber` query parameter needs to be provided as a number.  

For example GET `http://localhost:3000/?lineNumber=4` will you give you back line 4 from the file.  

In order to be able to respond with the line specified I set up my code to first save all the line breaks (`\n`) found in the file.  I saved the byte indexes of all the line breaks.  Having this information allows me to figure out the start byteIndex and the end byteIndex for a given line.  For instance to retreive `line 1` I can retrieve the text from the beginning of the file to the first byte index.

In `src/app.ts` the `ReadFileLines` class is imported and given a filePath when instantiated.  The `ReadFileLines` also has an `endpoint` method to be used on the express server and a `readFileIndexesIntoMemory` method to be run before the server starts.  `readFileIndexesIntoMemory` saves the byte indexes of the line breaks in the file.  The `endpoint` method assumes `readFileIndexesIntoMemory` has already been executed.

## How will your system perform with a 1 GB file? a 10 GB file? a 100 GB file?

The system should be able to function with all file sizes.  Though the larger the file size the longer it will take for the system/server to start listening as it first reads all the line breaks from the file before starting to listen.  Increasing the buffer size to read more at a time would likely speed it up, of course how much it can be increased depends on what it's being run on.

It would only not completely not function if there are so many line breaks that the number of byte indexes that are stored exceeds the memory available.

Retrieving the line after processing all the line break indexes will be the same constant speed.

## How will your system perform with 100 users? 10000 users? 1000000 users?
I think it greatly depends on how it would end up being deployed.  Though because it isn't doing any heavy computations on each request after the server is listening the system will be able to handle scaling up.

## What documentation, websites, papers, etc did you consult in doing this assignment?
https://nodejs.org/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback

## What third-party libraries or other tools does the system use? How did you choose each library or framework you used?

I'm using a node express server.  I picked this mainly as it's the only server I'm very familiar with to run locally.  I also wanted to do it in Typescript.  

I used lodash's `flatten` method.  I've gotten very familiar with lodash as it has plenty of useful data manipulation methods.

## How long did you spend on this exercise? If you had unlimited more time to spend on this, how would you spend it and how would you prioritize each item?

I spent about 4 hours on this assignment.  About the first 30 minutes was setting up an express server using typescript.  The next 45 min was exploring different ways to use the `fs` module to solve the problem.  The rest of it was spent on first implementing it using just functions.  Though then I realized refactoring it to use a `ReadFileLines` class made more sense for readibility and testing.

If I had unlimited time:
  1. I would spend time putting in unit tests so I'd be more confident when refactoring.  I like to make sure I do true TDD by writing unit tests first though in this case I wasn't exactly sure what methods I would need so I felt I needed to start with the implementation first.  Though for updates to the code it would be beneficial to have tests to be able to learn from and to use to create a new test before implementing the change.
  2. Performance may be able to be enhanced by caching reads from the file.  Though the line breaks are indexed, the file is still opened on every request to retrieve the line.  If it's determined users are commonly requesting the same lines in a short amount of time then caching the file lines for some time could lower the number of file reads.

## If you were to critique your code, what would you have to say about it?

I don't like the method names I came up with.  I think I did a decent job of making sure the methods have a single responsibility, but I would ask a teammember if they have better ideas on what to name those responsibilities.  