import { Types } from "mongoose";
import { BadRequestException } from "@nestjs/common";

/**
 * Validate the ID
 * @param id 
 * if id is null throw BadRequestException
 * if id is not valid throw BadRequestException
 * @returns BadRequestException
 * 
 */
export const  validateID = (id: string) => {
   if(id === null){
    throw new BadRequestException('ID is null');
   }
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
  }