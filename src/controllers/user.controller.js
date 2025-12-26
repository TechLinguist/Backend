import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadResult } from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    
    const { username, fullname, email, password } = req.body;
    console.log("email", email);

    // if(fullname === " ") {
    //     throw new ApiError(400 , "Fullname is required");
    // }

    if (
        [fullname , email, password, username].some(field => !field || field.trim() === "")
    ) {
        throw new ApiError(400 , "All fields are required");
    }
    const existedUser = User.findOne({
        $or: [
            {email},
            {username}
        ]
    })
    if(existedUser) {
        throw new ApiError(409, "User already exists with this email or username");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadResult(avatarLocalPath, "avatars")
    const coverImage = await uploadResult(coverImageLocalPath, "coverImages")

    if(!avatar) {
        throw new ApiError(500, "Error uploading avatar");
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



export {registerUser};