import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4001;  

app.use(cors());
app.use(express.json());


const userProfile = {
  data: {
    name: "john",
    age: 20
  }
};


app.get("/profiles", (req, res) => {
  return res.status(200).json(userProfile);  
});


if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}


export default app;

