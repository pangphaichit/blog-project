import express from "express";
import cors from "cors";

const app = express();

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

export default app;

