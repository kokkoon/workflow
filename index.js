const express = require("express");
const app = express();


require('./routes/jobRoutes')(app);

const PORT = 4000;
app.listen(4000, () => {
  console.log(`Server is running on port ${PORT}`)
})
