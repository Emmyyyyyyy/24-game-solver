const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://eemmyy:TdgPvNpAB1rhcVh8@equation.3tvwvuh.mongodb.net/Equation?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const equationSchema = new mongoose.Schema({
    inputNumbers: [Number],
    solutions: [String],
}, { collection: 'equations' });

const Equation = mongoose.model('Equation', equationSchema);

app.get('/cheat24', async (req, res) => {
    const inputNumbers = req.query.number.split('').map(Number);
    if (inputNumbers.length !== 4 || inputNumbers.some(num => num === 0)) {
      return res.status(400).json({ error: 'Invalid input. Please provide exactly 4 non-zero numbers.' });
    }
  
    const existingEquation = await Equation.findOne({ inputNumbers });
    if (existingEquation) {
      return res.json(existingEquation.solutions);
    }
  
    const solutions = find24Equations(inputNumbers);
  
    const newEquation = new Equation({ inputNumbers, solutions });
    await newEquation.save();
  
    res.json(solutions);
});
 
function find24Equations(number) {
  const permutations = getPermutations(number);
  const operators = ['+', '-', '*', '/'];

  const equations = [];

  for (const perm of permutations) {
    for (const op1 of operators) {
      for (const op2 of operators) {
        for (const op3 of operators) {
          const expression1 = `((${perm[0]} ${op1} ${perm[1]}) ${op2} ${perm[2]}) ${op3} ${perm[3]}`;
          const expression2 = `(${perm[0]} ${op1} (${perm[1]} ${op2} ${perm[2]})) ${op3} ${perm[3]}`;
          const expression3 = `${perm[0]} ${op1} ((${perm[1]} ${op2} ${perm[2]}) ${op3} ${perm[3]})`;
          const expression4 = `${perm[0]} ${op1} (${perm[1]} ${op2} (${perm[2]} ${op3} ${perm[3]}))`;
          const expression5 = `(${perm[0]} ${op1} ${perm[1]}) ${op2} (${perm[2]} ${op3} ${perm[3]})`;

          const result1 = eval(expression1);
          const result2 = eval(expression2);
          const result3 = eval(expression3);
          const result4 = eval(expression4);
          const result5 = eval(expression5);

          if (result1 === 24) equations.push(expression1);
          if (result2 === 24) equations.push(expression2);
          if (result3 === 24) equations.push(expression3);
          if (result4 === 24) equations.push(expression4);
          if (result5 === 24) equations.push(expression5);
        }
      }
    }
  }
  return equations;
}

function getPermutations(arr) {
  if (arr.length === 1) {
    return [arr];
  }

  const result = [];

  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const permutations = getPermutations(remaining);

    for (const perm of permutations) {
      result.push([current, ...perm]);
    }
  }

  return result;
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
