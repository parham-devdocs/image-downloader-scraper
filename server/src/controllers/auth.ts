import { Request, Response } from "express";
import { User } from "../types";
import {
  decodeJWT,
  generateAccessToken,
  generateRefreshToken,
} from "../util/jwt";
import { hash, compare } from "../util/hash";
import { UserModel } from "../model/user";

export async function login(req: Request<any, any, User>, res: Response) {
  const { body } = req;
  const startTime = Date.now();

  console.log(`[AUTH-LOGIN] Attempt started for user: ${body.username}`);

  try {
    const user = await UserModel.findOne({ username: body.username });

    if (!user) {
      console.warn(`[AUTH-LOGIN] Failed: User "${body.username}" not found.`);
      res.status(401).json({ message: "User does not exists" });
      return;
    }

    const isPasswordValid = await compare(body.password, user.password);

    if (!isPasswordValid) {
      console.warn(`[AUTH-LOGIN] Failed: Incorrect password for user: ${body.username}`);
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.id.toString());
    const refreshToken = generateRefreshToken(user.id.toString());

    await UserModel.updateOne(
      { _id: user._id },
      { refreshToken }
    );

    // ✅ FIXED: Properly chain the cookie setters
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
      path: '/'
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000 * 24 * 7,
      path: '/'
    });
    
    // ✅ Send response separately
    res.status(200).json({ 
      message: "login successful", 
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
    
    // ❌ Remove this - don't send user object in headers (security risk)
    // res.setHeader("user", JSON.stringify(userObj));

    console.log(`[AUTH-SUCCESS] Login complete for ${body.username}. Duration: ${Date.now() - startTime}ms`);

  } catch (error) {
    console.error(`[AUTH-ERROR] Critical failure for ${body.username}:`, error);
    res.status(500).json({ message: "Server error" });
    return;
  }
}



export async function register(req: Request<any, any, User>, res: Response) {
  console.log("➡️ ENTER register()");
  console.log("Request body:", req.body);
  console.log("Cookies:", req.cookies);

  const { body } = req;

  const accessToken = generateAccessToken(body.email);
  const refreshToken = generateRefreshToken(body.email);

  console.log("Generated tokens:", { accessToken, refreshToken });

  try {
    console.log("🔍 Checking existing username...");
    const existingUsername = await UserModel.findOne({
      username: body.username,
    });
    console.log("Existing username result:", existingUsername);

    console.log("🔍 Checking existing email...");
    const existingEmail = await UserModel.findOne({
      email: body.email,
    });
    console.log("Existing email result:", existingEmail);

    if (existingUsername || existingEmail) {
      console.log("❌ User already exists — aborting");
       res.status(409).json({ error: "user already exists" });
       return
    }

    console.log("🔐 Hashing password...");
    const hashedPassword = await hash(body.password);

    console.log("📝 Creating new user in MongoDB...");
    const newUser = await UserModel.create({
      password: hashedPassword,
      userId: body.userId,
      username: body.username,
      email: body.email,
      refreshToken,
    });

    console.log("✅ User created successfully:", newUser);
    res.setHeader("user", JSON.stringify(newUser.toObject())); 

    console.log("🍪 Setting accessToken cookie...");
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("🍪 Setting refreshToken cookie...");
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("📤 Sending success response...");
     res.json({ message: "registered successful" ,newUser});

  } catch (error:any) {
    console.error("🔥 ERROR in register():", error);
    console.error("Stack trace:", error?.stack);

    if (!res.headersSent) {
     res.status(500).json({ message: "server error", error });
    }

    console.log("⚠️ WARNING: Headers already sent. Cannot respond again.");
  }
}

export async function logout(req: Request<any, any, User>, res: Response) {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      res.status(403).json({ message: "User not logged in" });
    }

    // Decode the access token (make sure this returns the expected payload)
    const decodedToken = decodeJWT(accessToken, "access") as string;
    if (!decodedToken) {
      res.status(401).json({ message: "Invalid access token" });
  
    }
console.log({decodedToken})
    const user = await UserModel.findOne({
      _id: decodedToken,
    });
console.log({user})
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.refreshToken) {
      res.status(200).json({ message: "User already logged out" });
      return;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(user._id, {
      refreshToken: null,
    });
    res.clearCookie("accessToken");
    res.status(200).json({
      message: "User successfully logged out",
      updatedUser,
    });
    return;
  } catch (error: any) {
    console.error("Logout error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
    return;
  }
}

// export async function refreshToken(req: Request<any, any, User>, res: Response) {
//   const refreshToken=req.cookies.refreshToken
//   if (!refreshToken) {
//     res.status(404).json({ message: "User not found" });
// return
//   }
//   const user=await prisma.user.findFirst({where:{refreshToken},select:{username:true,refreshToken:true}})
//   if (user && user?.refreshToken && user?.refreshToken===refreshToken) {
//     const generatedAccessToken= generateAccessToken(user?.username)
//     const generatedRefreshToken=generateRefreshToken(user.username)
//     const updatedUser=await prisma.user.update({where:{username:user.username},data:{refreshToken:generatedRefreshToken}})
//     res.cookie("accessToken", generatedAccessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     })
//     res.cookie("refreshToken",generatedRefreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     })
//     res.json({message:"refresh token and access token refreshedz",refreshToken:generatedRefreshToken})
//   }

// }
