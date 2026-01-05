const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err));
    }
}

export {asyncHandler} 

// This is a ** higher - order function**:

// * It ** takes a function**
// * Returns a ** new function** with extra behavior

// Think of it as a ** protective wrapper ** around your route logic.

// ---

// ### Step 1: `requestHandler` — what is this ?

//     `requestHandler` is ** your route function**.

//         Example:

// ```js
// async (req, res) => {
//   const user = await User.findById(req.params.id)
//   res.json(user)
// }
// ```

// You pass this function into `asyncHandler`.

// ---

// ### Step 2: Why return another function?

// Express expects middleware in this shape:

// ```js
// (req, res, next) => { ... }
// ```

// So`asyncHandler` ** returns ** a function that Express can actually use.

// This returned function becomes the * real * route handler.

// ---

// ### Step 3: The sneaky genius part — `Promise.resolve(...)`

//     ```js
// Promise.resolve(requestHandler(req, res, next))
// ```

// This does two clever things at once:

// 1. If `requestHandler` is ** async ** → it already returns a Promise → `Promise.resolve` just uses it.
// 2. If `requestHandler` is ** not async ** → it returns a normal value → `Promise.resolve` wraps it into a resolved Promise.

//     Result:
// ** Everything becomes a Promise.No exceptions.No excuses.**

//     This is why this works universally.

// ---

// ### Step 4: Centralized error catching

//     ```js
// .catch((err) => next(err))
// ```

// Any error that happens inside:

// * `await`
//     * a rejected Promise
//         * a thrown error inside async code

// gets caught here and passed to:

// ```js
// next(err)
// ```

// And ** that ** is Express’s official “handle this error properly” button.

// Which means:

// * Your global error middleware runs
//     * No unhandled promise rejections
//         * No server crashes
//             * No ghost bugs at 3 AM

// ---

// ### Step 5: How you actually use it

// Instead of this:

// ```js
// router.get("/users", async (req, res, next) => {
//   try {
//     const users = await User.find()
//     res.json(users)
//   } catch (err) {
//     next(err)
//   }
// })
// ```

// You write this:

// ```js
// router.get(
//   "/users",
//   asyncHandler(async (req, res) => {
//     const users = await User.find()
//     res.json(users)
//   })
// )
// ```

// Cleaner.
//     Sharper.
// Less brain damage.

// ---

// ### Mental model(important)

// Think of`asyncHandler` as:

// > “Whatever happens inside this async function, I promise to catch it and forward it to Express.”

// It’s a ** seatbelt **, not an airbag.You hope you never need it, but you’re insane without it.

// ---

// ### One subtle but powerful detail

// Notice this:

// ```js
// requestHandler(req, res, next)
// ```

// You’re still passing`next`, so:

// * You can ** manually call`next()` ** if needed
//     * You’re not losing any Express functionality

// This is a full - fidelity wrapper, not a toy.

// ---

// ### TL; DR in human words

//     * Express doesn’t catch async errors by default
// * `asyncHandler` wraps async routes
//     * Converts everything into a Promise
//         * Forwards all errors to Express’s error middleware
//             * Deletes repetitive`try/catch`
//                 * Makes your backend production - grade instead of “works on my machine”

// This pattern shows up in ** real - world codebases **—including the kind that interviewers quietly respect.

// Once you internalize this, you start seeing backend code as systems, not just syntax.
