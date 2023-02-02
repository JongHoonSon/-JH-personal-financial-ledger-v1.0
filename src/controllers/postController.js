import { boardModel, postModel } from "./../db/models";
import checkPostOwner from "./../middlewares/post/checkPostOwner";

class PostController {
  async getAddPost(req, res, next) {
    try {
      const boardList = await boardModel.find({});
      const boardNameList = boardList.map((board) => board.name);

      return res.status(200).render("post/add-post/add-post", {
        pageTitle: "글 작성",
        boardNameList,
      });
    } catch (error) {
      return next(error);
    }
  }

  async addPost(req, res, next) {
    const { title, boardName, content } = req.body;

    const user = req.session.loggedInUser;

    const board = await boardModel.findOne({ name: boardName });

    try {
      const newPost = await postModel.create({
        title,
        board,
        owner: user,
        content,
      });

      user.postList.push(newPost);
      await user.save();

      board.postList.push(newPost);
      await board.save();

      req.flash("success", "게시글을 작성하였습니다.");
      return res.status(200).redirect(`/post/${newPost._id}`);
    } catch (error) {
      error.message = "게시글을 생성하는 과정에서 오류가 발생했습니다.";
      error.redirectURL = "/post/add";
      return next(error);
    }
  }

  async getEditPost(req, res, next) {
    const { postId } = req.params;

    let post;
    try {
      post = await postModel.findByIdWithPopulate(postId).populate({
        path: "board",
        populate: "postList",
      });
    } catch (error) {
      error.message = "게시글을 DB에서 찾는 과정에서 오류가 발생했습니다.";
      error.redirectURL = "/board/전체게시판/1";
      return next(error);
    }

    const user = req.session.loggedInUser;

    checkPostOwner(post, user, next);

    let boardList;
    try {
      boardList = await boardModel.find({});
    } catch (error) {
      error.message = "게시판을 DB에서 찾는 과정에서 오류가 발생했습니다.";
      return next(error);
    }
    const boardNameList = boardList.map((board) => board.name);

    return res.status(200).render("post/edit-post/edit-post", {
      pageTitle: "게시글 수정",
      post,
      postId,
      boardNameList,
    });
  }

  async editPost(req, res, next) {
    const { postId } = req.params;

    const {
      title: newTitle,
      boardName: newBoardName,
      content: newContent,
    } = req.body;

    let post;
    try {
      post = await postModel.findByIdWithPopulate(postId).populate({
        path: "board",
        populate: "postList",
      });
    } catch (error) {
      error.message = "게시글을 DB에서 찾는 과정에서 오류가 발생했습니다.";
      error.redirectURL = "/board/전체게시판/1";
      return next(error);
    }

    const user = req.session.loggedInUser;

    checkPostOwner(post, user, next);

    try {
      if (newBoardName !== post.board.name) {
        post.board.postList = post.board.postList.filter(
          (el) => String(el._id) !== String(post.id)
        );
        await post.board.save();

        const board = await boardModel.findOne({ name: newBoardName });
        board.postList.push(post);
        await board.save();

        post.board = board;
      }

      post.title = newTitle;
      post.content = newContent;
      await post.save();

      req.flash("success", "게시글을 수정했습니다.");
      return res.status(200).json(`/post/${postId}`);
    } catch (error) {
      error.message = "게시글을 수정하는 과정에서 오류가 발생했습니다.";
      error.redirectURL = "/board/전체게시판/1";
      return next(error);
    }
  }

  async deletePost(req, res, next) {
    const { postId } = req.params;

    let post;
    try {
      post = await postModel.findByIdWithPopulate(postId).populate({
        path: "board",
        populate: "postList",
      });
    } catch (error) {
      error.message = "게시글을 DB에서 찾는 과정에서 오류가 발생했습니다.";
      error.redirectURL = "/board/전체게시판/1";
      return next(error);
    }

    const user = req.session.loggedInUser;

    checkPostOwner(post, user, next);

    try {
      user.postList = user.postList.filter(
        (el) => String(el._id) !== String(post.id)
      );
      await user.save();

      post.board.postList = post.board.postList.filter(
        (el) => String(el._id) !== String(post.id)
      );
      await post.board.save();

      await postModel.findByIdAndDelete(postId);

      req.flash("success", "게시글을 삭제했습니다.");
      if (req.session.history.prevPageURL) {
        return res.status(200).json(req.session.history.prevPageURL);
      }
    } catch (error) {
      error.message = "게시글을 삭제하는 과정에서 오류가 발생했습니다.";
      return next(error);
    }
  }

  async getDetailPost(req, res, next) {
    const { postId } = req.params;

    let post;
    try {
      post = await postModel
        .findByIdWithPopulate(postId)
        .populate("board")
        .populate("owner")
        .populate({
          path: "commentList",
          populate: { path: "owner" },
        });
    } catch (error) {
      error.message = "게시글을 DB에서 찾는 과정에서 오류가 발생했습니다.";
      error.redirectURL = "/board/전체게시판/1";
      return next(error);
    }

    const user = req.session.loggedInUser;

    let alreadyLiked = false;

    for (let i = 0; i < post.likesUserList.length; i++) {
      if (String(post.likesUserList[i]._id) === String(user._id)) {
        alreadyLiked = true;
        break;
      }
    }

    return res.status(200).render("post/detail-post/detail-post", {
      pageTitle: "글 상세보기",
      post,
      alreadyLiked,
    });
  }

  async increasePostViews(req, res, next) {
    const { postId } = req.params;

    let post;
    try {
      post = await postModel.findById(postId);
    } catch (error) {
      return next(error);
    }

    try {
      post.views += 1;
      await post.save();
    } catch (e) {
      error.message =
        "게시글의 조회수를 증가시키는 과정에서 오류가 발생했습니다.";
      error.redirectURL = "/board/전체게시판/1";
      return next(error);
    }

    return res.sendStatus(200);
  }

  async togglePostLikes(req, res, next) {
    const { postId } = req.params;

    const user = req.session.loggedInUser;

    let post;
    try {
      post = await postModel
        .findByIdWithPopulate(postId)
        .populate("likesUserList");
    } catch (error) {
      error.message = "게시글을 DB에서 찾는 과정에서 오류가 발생했습니다.";
      error.redirectURL = "/board/전체게시판/1";
      return next(error);
    }

    let alreadyIn = false;
    let indexInLikesUserList;

    for (let i = 0; i < post.likesUserList.length; i++) {
      if (String(post.likesUserList[i]._id) === String(user._id)) {
        alreadyIn = true;
        indexInLikesUserList = i;
        break;
      }
    }

    if (alreadyIn) {
      try {
        post.likesUserList.splice(indexInLikesUserList, 1);
        await post.save();

        let indexInPostList;
        user.likesPostList.forEach((post, index) => {
          if (String(post._id) === postId) {
            indexInPostList = index;
          }
        });
        user.likesPostList.splice(indexInPostList, 1);
        await user.save();

        req.flash("success", "좋아요 취소 완료");
        return res.sendStatus(200);
      } catch (error) {
        error.message =
          "게시글의 좋아요 수를 변경하는 과정에서 오류가 발생했습니다.";
        error.redirectURL = "/board/전체게시판/1";
        return next(error);
      }
    } else {
      try {
        post.likesUserList.push(user);
        await post.save();

        user.likesPostList.push(post);
        await user.save();
      } catch (error) {
        error.message =
          "게시글의 좋아요 수를 변경하는 과정에서 오류가 발생했습니다.";
        error.redirectURL = "/board/전체게시판/1";
        return next(error);
      }

      req.flash("success", "좋아요 완료");
      return res.sendStatus(200);
    }
  }
}

const postController = new PostController();

export default postController;
