// course.dto.ts
export class ModuleDto {
    moduleName: string;
    moduleContent:string;
    moduleDate: Date;
  }
  
  export class InstallmentDto {
    installmentNumber:number;
    installmentDate: Date;
    installmentPrice: number;
  }
  
  export class CourseDto {
    id: number;
    courseName?: string;
    courseImg?: string;
    startDate?: Date;
    endDate?: Date;
    upfrontFees?: number;
    price?: number;
    trainerID?: number;
    modules: ModuleDto[];
    installments: InstallmentDto[];
  }
  