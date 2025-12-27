import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadResult } from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        
        return { accessToken, refreshToken };

    }
    catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    
    const { username, fullname, email, password } = req.body;
    // console.log("email", email);

    // if(fullname === " ") {
    //     throw new ApiError(400 , "Fullname is required");
    // }

    if (
        [fullname , email, password, username].some(field => !field || field.trim() === "")
    ) {
        throw new ApiError(400 , "All fields are required");
    }
    const existedUser = await User.findOne({
        $or: [
            {email},
            {username}
        ]
    })
    if(existedUser) {
        throw new ApiError(409, "User already exists with this email or username");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;


    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadResult(avatarLocalPath, "avatars")
    
    if(!avatar) {
        throw new ApiError(500, "Error uploading avatar");
    }
    
    // const coverImage = await uploadResult(coverImageLocalPath, "coverImages")
    
    let coverImage;
    if (coverImageLocalPath) {
    coverImage = await uploadResult(coverImageLocalPath, "coverImages");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "" ,
        email,
        username : username.toLowerCase(),
        password
    })

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createUser) {
        throw new ApiError(500, "Error creating user");
    }

    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", createUser)
    );
})

const loginUser = asyncHandler(async (req, res) => {

    const {username, password, email} = req.body;

    if(!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const tokens = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure:true
    }
    return res.status(200)
    .cookie("accessToken", tokens.accessToken, options)
    .cookie("refreshToken", tokens.refreshToken, options)
    .json(
        new ApiResponse(200, "User logged in successfully", {
            user: loggedInUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
    }))
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id , 
        {
            $set: {
                refresh:undefined
            }
        },
        {new:true}
    )
    const options = {
        httpOnly: true,
        secure:true
    }
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    )
})

export {registerUser , loginUser , logoutUser};