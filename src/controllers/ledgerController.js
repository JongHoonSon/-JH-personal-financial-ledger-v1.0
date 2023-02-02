import { userModel } from "./../db/models";
import { sortItem, getStringDate, getStringAmount } from "../utils";

class LedgerController {
  async getLedgerDaily(req, res) {
    const { yyyy, mm, dd, itemType } = req.params;

    const todayStringDate = yyyy + "-" + mm + "-" + dd;
    const todayDate = new Date(todayStringDate);

    const prevDate = new Date(todayDate.getTime());
    prevDate.setDate(todayDate.getDate() - 1);
    const prev = getStringDate(prevDate);

    const nextDate = new Date(todayDate.getTime());
    nextDate.setDate(todayDate.getDate() + 1);
    const next = getStringDate(nextDate);

    const loggedInUser = req.session.user;
    let user;
    try {
      user = await userModel
        .findByIdWithPopulate(loggedInUser._id)
        .populate("incomeList")
        .populate("expenseList");
    } catch (error) {
      console.log(error);
      req.flash("error", "유저를 불러오는 과정에서 오류가 발생했습니다.");
      return res.status(500).redirect("/");
    }

    const { incomeList, expenseList } = user;

    let sumIncomeAmount = 0;
    let sumExpenseAmount = 0;

    const itemList = new Array();
    if (itemType === "all" || itemType === "i") {
      incomeList.forEach((el) => {
        if (el.stringDate === todayStringDate) {
          itemList.push(el);
          sumIncomeAmount += el.amount;
        }
      });
    }
    if (itemType === "all" || itemType === "e") {
      expenseList.forEach((el) => {
        if (el.stringDate === todayStringDate) {
          itemList.push(el);
          sumExpenseAmount += el.amount;
        }
      });
    }
    sortItem(itemList);

    let gap = sumIncomeAmount - sumExpenseAmount;
    let stringAbsGap = getStringAmount(Math.abs(gap));
    let stringSumIncomeAmount = getStringAmount(sumIncomeAmount);
    let stringSumExpenseAmount = getStringAmount(sumExpenseAmount);

    const cycle = "daily";
    const now = todayStringDate;
    const calendarTitle = todayStringDate;

    return res.render("ledger/ledger", {
      pageTitle: "일별 내역",
      itemList,
      prev,
      now,
      next,
      calendarTitle,
      cycle,
      gap,
      stringAbsGap,
      stringSumIncomeAmount,
      stringSumExpenseAmount,
      itemType,
    });
  }

  async getLedgerWeekly(req, res) {
    const { yyyy, mm, dd, itemType } = req.params;

    const todayStringDate = yyyy + "-" + mm + "-" + dd;
    const todayDate = new Date(todayStringDate);
    const todayWeek = todayDate.getWeek();

    const prevDate = new Date(todayDate.getTime());
    prevDate.setDate(todayDate.getDate() - 7);
    const prev = getStringDate(prevDate);

    const nextDate = new Date(todayDate.getTime());
    nextDate.setDate(todayDate.getDate() + 7);
    const next = getStringDate(nextDate);

    const todayDay = todayDate.getDay();

    const weekStartDate = new Date(todayDate.getTime());
    weekStartDate.setDate(todayDate.getDate() - todayDay);
    const weekStart = getStringDate(weekStartDate);

    const weekEndDate = new Date(todayDate.getTime());
    weekEndDate.setDate(todayDate.getDate() - todayDay + 6);
    const weekEnd = getStringDate(weekEndDate);

    const loggedInUser = req.session.user;
    let user;
    try {
      user = await userModel
        .findByIdWithPopulate(loggedInUser._id)
        .populate("incomeList")
        .populate("expenseList");
    } catch (error) {
      console.log(error);
      req.flash("error", "유저를 불러오는 과정에서 오류가 발생했습니다.");
      return res.status(500).redirect("/");
    }

    const { incomeList, expenseList } = user;

    let sumIncomeAmount = 0;
    let sumExpenseAmount = 0;

    const itemList = new Array();
    if (itemType === "all" || itemType === "i") {
      incomeList.forEach((el) => {
        if (el.stringDate >= weekStart && el.stringDate <= weekEnd) {
          itemList.push(el);
          sumIncomeAmount += el.amount;
        }
      });
    }
    if (itemType === "all" || itemType === "e") {
      expenseList.forEach((el) => {
        if (el.stringDate >= weekStart && el.stringDate <= weekEnd) {
          itemList.push(el);
          sumExpenseAmount += el.amount;
        }
      });
    }
    sortItem(itemList);

    let gap = sumIncomeAmount - sumExpenseAmount;
    let stringAbsGap = getStringAmount(Math.abs(gap));
    let stringSumIncomeAmount = getStringAmount(sumIncomeAmount);
    let stringSumExpenseAmount = getStringAmount(sumExpenseAmount);

    const cycle = "weekly";
    const now = todayStringDate;

    const calendarTitle = weekStart + " ~ " + weekEnd;

    return res.render("ledger/ledger", {
      pageTitle: "주별 내역",
      itemList,
      prev,
      now,
      next,
      calendarTitle,
      cycle,
      gap,
      stringAbsGap,
      stringSumIncomeAmount,
      stringSumExpenseAmount,
      itemType,
    });
  }

  async getLedgerMonthly(req, res) {
    const { yyyy, mm, itemType } = req.params;

    const prevMonth =
      mm === "01" ? "12" : (Number(mm) - 1).toString().padStart(2, 0);
    const prevYear = prevMonth === "12" ? (Number(yyyy) - 1).toString() : yyyy;
    const prev = prevYear + "-" + prevMonth;

    const nextMonth =
      mm === "12" ? "01" : (Number(mm) + 1).toString().padStart(2, 0);
    const nextYear = nextMonth === "01" ? (Number(yyyy) + 1).toString() : yyyy;
    const next = nextYear + "-" + nextMonth;

    const loggedInUser = req.session.user;
    let user;
    try {
      user = await userModel
        .findByIdWithPopulate(loggedInUser._id)
        .populate("incomeList")
        .populate("expenseList");
    } catch (error) {
      console.log(error);
      req.flash("error", "유저를 불러오는 과정에서 오류가 발생했습니다.");
      return res.status(500).redirect("/");
    }

    const { incomeList, expenseList } = user;

    let sumIncomeAmount = 0;
    let sumExpenseAmount = 0;

    const itemList = new Array();
    if (itemType === "all" || itemType === "i") {
      incomeList.forEach((el) => {
        if (
          el.date.getFullYear().toString() === yyyy &&
          (el.date.getMonth() + 1).toString().padStart(2, 0) === mm
        ) {
          itemList.push(el);
          sumIncomeAmount += el.amount;
        }
      });
    }
    if (itemType === "all" || itemType === "e") {
      expenseList.forEach((el) => {
        if (
          el.date.getFullYear().toString() === yyyy &&
          (el.date.getMonth() + 1).toString().padStart(2, 0) === mm
        ) {
          itemList.push(el);
          sumExpenseAmount += el.amount;
        }
      });
    }
    sortItem(itemList);

    let gap = sumIncomeAmount - sumExpenseAmount;
    let stringAbsGap = getStringAmount(Math.abs(gap));
    let stringSumIncomeAmount = getStringAmount(sumIncomeAmount);
    let stringSumExpenseAmount = getStringAmount(sumExpenseAmount);

    const cycle = "monthly";
    const now = yyyy + "-" + mm;
    const calendarTitle = yyyy + "-" + mm;

    return res.render("ledger/ledger", {
      pageTitle: "월별 내역",
      itemList,
      prev,
      now,
      next,
      calendarTitle,
      cycle,
      gap,
      stringAbsGap,
      stringSumIncomeAmount,
      stringSumExpenseAmount,
      itemType,
    });
  }

  async getLedgerYearly(req, res) {
    const { yyyy, itemType } = req.params;

    const prev = (Number(yyyy) - 1).toString();
    const next = (Number(yyyy) + 1).toString();

    const loggedInUser = req.session.user;
    let user;
    try {
      user = await userModel
        .findByIdWithPopulate(loggedInUser._id)
        .populate("incomeList")
        .populate("expenseList");
    } catch (error) {
      console.log(error);
      req.flash("error", "유저를 불러오는 과정에서 오류가 발생했습니다.");
      return res.status(500).redirect("/");
    }

    const { incomeList, expenseList } = user;

    let sumIncomeAmount = 0;
    let sumExpenseAmount = 0;

    const itemList = new Array();
    if (itemType === "all" || itemType === "i") {
      incomeList.forEach((el) => {
        if (el.date.getFullYear().toString() === yyyy) {
          itemList.push(el);
          sumIncomeAmount += el.amount;
        }
      });
    }
    if (itemType === "all" || itemType === "e") {
      expenseList.forEach((el) => {
        if (el.date.getFullYear().toString() === yyyy) {
          itemList.push(el);
          sumExpenseAmount += el.amount;
        }
      });
    }
    sortItem(itemList);

    let gap = sumIncomeAmount - sumExpenseAmount;
    let stringAbsGap = getStringAmount(Math.abs(gap));
    let stringSumIncomeAmount = getStringAmount(sumIncomeAmount);
    let stringSumExpenseAmount = getStringAmount(sumExpenseAmount);

    const cycle = "yearly";
    const now = yyyy;
    const calendarTitle = yyyy;

    return res.render("ledger/ledger", {
      pageTitle: "연도별 내역",
      itemList,
      prev,
      now,
      next,
      calendarTitle,
      cycle,
      gap,
      stringAbsGap,
      stringSumIncomeAmount,
      stringSumExpenseAmount,
      itemType,
    });
  }
}

const ledgerController = new LedgerController();

export default ledgerController;
