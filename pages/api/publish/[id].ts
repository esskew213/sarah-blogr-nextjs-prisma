import prisma from '../../../lib/prisma';

// recall that only posts with published true are shown on home page
//  route handler retrieves the ID of a Post from the URL and then
// uses Prisma Client's update method to set the published field of the Post record to true.
export default async function handle(req, res) {
  const postId = req.query.id;
  const post = await prisma.post.update({
    where: { id: postId },
    data: { published: true },
  });
  res.json(post);
}
