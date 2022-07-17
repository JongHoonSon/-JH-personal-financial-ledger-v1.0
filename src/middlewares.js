export const localMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user || {};
  const date = new Date();
  res.locals.date = date;
  res.locals.thisYear = date.getFullYear().toString();
  res.locals.thisMonth = (date.getMonth() + 1).toString().padStart(2, 0);
  res.locals.thisDay = date.getDate().toString().padStart(2, 0);
  console.log(res.locals);
  next();
};

export const userOnlyMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "먼저 로그인을 해주세요.");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "잘못된 접근입니다.");
    return res.redirect("/");
  }
};
