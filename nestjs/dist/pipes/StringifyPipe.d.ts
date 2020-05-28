import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class StringifyPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): any;
}
