const router = require('express').Router();
const withAuth = require('../utils/auth');
const { User, Transaction, Budget } = require('../models');


//Rrender application homepage
router.get('/', async (req, res) => {
  console.log("-------------------")
  console.log("USER1" + req.session.name);
  console.log("-------------------")

  res.render('homepage', {
    loggedIn: req.session.loggedIn // homepage now renders as logged in
  });
});

//check to see if user is loggedin or else display login/signup form
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
    return;
  }
  res.render('login');
});

router.get('/signup', (req, res) => {
  res.render('signup');
});


//HTML page to render users transactions
router.get('/profile', withAuth, async (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect('/');
    return;
  }
  try {
    const transactionData = await Transaction.findAll({
      where: { user_id: req.session.user_id },
    });
    const budgetData = await Budget.findOne({
      where: { user_id: req.session.user_id },
    });

    //     const expenseData = await Transaction.findAll({
    //       attributes: [
    //         [sequelize.fn('sum', sequelize.col('amount')), 'total'],
    //       ]
    //     }); 
    //     const expense = expenseData.map((exp) => exp.get({ plain: true }));

    let transactions = {}
    if (transactionData) {
      transactions = transactionData.map((trans) => trans.get({ plain: true }));
    }

    let budget = {}
    if (!budgetData) {
      budget.amount = 0
    } else {
      budget = budgetData.get({ plain: true })
    }

    var sumIncome = 0;
    var sumExpense = 0;
    transactions.forEach(transaction => {
      if (transaction.category === 'income') {
        sumIncome += transaction.amount
      } else if (transaction.category === 'expense') {
        sumExpense += transaction.amount
      }
    })

    res.render('profile', {
      loggedIn: req.session.loggedIn,
      transactions,
      date: req.body.date,
      category: req.body.category,
      subcategory: req.body.subCategory,
      description: req.body.description,
      amount: req.body.amount,
      budget: budget,
      sumIncome: sumIncome,
      sumExpense: sumExpense
    });
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
});

module.exports = router;

