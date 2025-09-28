import express from "express";
import loginRouter from "../route/login.js";
import usersRouter from "../route/users.js";
import hostRouter from "../route/hosts.js";
import propertiesRouter from "../route/properties.js";
import bookingsRouter from "../route/bookings.js";
import reviewsRouter from "../route/reviews.js";
import log from "../middleware/logMiddleware.js";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import errorHandlerSentry from "../middleware/errorHandlerSentry.js";
import 'dotenv/config';

const app = express();
//Setry Intilize
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: "bookingapp@1.0.0", // required
  integrations: [
    Sentry.httpIntegration({ tracing: true }), // traces GET/POST/etc. at HTTP level
    new Tracing.Integrations.Express({ app }), // traces Express routes
  ],
  tracesSampleRate: 1.0, // 100% sampling; lower in production (e.g. 0.2)
  debug: false,
});

//Middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use(log);
app.use(express.json());


//Routs
app.use("/login", loginRouter);
app.use("/users", usersRouter);
app.use("/hosts", hostRouter);
app.use("/properties", propertiesRouter);
app.use("/bookings", bookingsRouter);
app.use("/reviews", reviewsRouter);

//Error handlers
app.use(errorHandlerSentry);

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
