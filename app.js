// budget controller

var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id
        this.description = description;
        this.value = value
    }

    var Income = function (id, description, value) {
        this.id = id
        this.description = description;
        this.value = value
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allitems[type].forEach(cur => {
            sum = sum + cur.value
        })
        data.totals[type] = sum
    }

    var data = {
        allitems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, des, val) {

            var newItem, ID;

            if (data.allitems[type].length > 0) {
                ID = data.allitems[type][data.allitems[type].length - 1].id + 1
            } else {
                ID = 0
            }


            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }

            data.allitems[type].push(newItem)

            return newItem
        },

        deleteItem: function (type, id) {

            var ids, index

            ids = data.allitems[type].map(function (current) {
                return current.id
            })

            index = ids.indexOf(+id)
            if (index !== -1) {
                data.allitems[type].splice(index, 1)
            }
        },

        calculateBudget: function () {
            calculateTotal('exp')
            calculateTotal('inc')

            if (data.totals.inc >= 0) {
                data.budget = data.totals.inc - data.totals.exp;
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        showdata: function () {
            console.log(data)
        }
    }

})();


// UI controller
var UIController = (function () {

    var Domstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }

    return {
        getinput: function () {
            return {
                type: document.querySelector(Domstrings.inputType).value, // get inc or exp
                description: document.querySelector(Domstrings.inputDescription).value,
                value: parseFloat(document.querySelector(Domstrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {

            var html, element

            if (type === 'inc') {
                element = Domstrings.incomeContainer
                html = `<div class="item clearfix" id="inc-${obj.id}">
                                <div class="item__description">${obj.description}</div>
                                <div class="right clearfix">
                                    <div class="item__value">${obj.value}</div>
                                    <div class="item__delete">
                                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                    </div>
                                </div>
                            </div>`
            } else if (type === 'exp') {

                element = Domstrings.expensesContainer

                html = ` <div class="item clearfix" id="exp-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${obj.value}</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
            }

            document.querySelector(element).insertAdjacentHTML('beforeend', html)

        },

        deleteListItem: function (selectorID) {
            document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID))
        },

        clearFields: function () {
            var fields, fieldArr
            fields = document.querySelectorAll(Domstrings.inputDescription + ', ' + Domstrings.inputValue)
            fieldArr = Array.prototype.slice.call(fields)
            fieldArr.forEach((current, index) => {
                current.value = ""
            })
            fieldArr[0].focus()
        },

        displayBudget: function (obj) {
            document.querySelector(Domstrings.budgetLabel).textContent = obj.budget
            document.querySelector(Domstrings.incomeLabel).textContent = obj.totalInc
            document.querySelector(Domstrings.expensesLabel).textContent = obj.totalExp

            if (obj.percentage > 0) {
                document.querySelector(Domstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(Domstrings.percentageLabel).textContent = '---'
            }
        },


        getDomstrings: function () {
            return Domstrings
        }
    }

})()



//GLOBAL Contoller
var controller = (function (budgetctrl, UIctrl) {


    var setupEventListners = function () {
        var Dom = UIctrl.getDomstrings()

        document.querySelector(Dom.inputBtn).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13) {
                ctrlAddItem()
            }
        })

        document.querySelector(Dom.container).addEventListener('click', ctrlDeleteItem)
    }

    var updateBudget = function () {
        //1.calculate the budget

        budgetctrl.calculateBudget()

        //2. return budget
        var budget = budgetController.getBudget()

        //3.display the budget on UI

        UIController.displayBudget(budget)
    };


    var ctrlAddItem = function () {

        var input, newItem

        // 1.get the filed input data
        input = UIctrl.getinput()

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2.add the item to the budget controller
            newItem = budgetctrl.addItem(input.type, input.description, input.value);

            //3.add the new item to the UI

            UIctrl.addListItem(newItem, input.type)

            //4.clear the fields

            UIctrl.clearFields()

            //5.calc and update budget

            updateBudget()
        }


    }


    var ctrlDeleteItem = function (event) {

        var itemId, splitID, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id
        if (itemId) {
            splitID = itemId.split('-')
            type = splitID[0]
            ID = splitID[1]
            budgetctrl.deleteItem(type, ID)
            UIctrl.deleteListItem(itemId)
            updateBudget()
        }
    }

    return {
        init: function () {
            console.log('App Started ...')
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListners()
        }
    }


})(budgetController, UIController)


controller.init()