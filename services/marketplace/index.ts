/**
 * Marketplace Service
 * Main entry point for course marketplace services
 */

export { CourseUploadService } from './course-upload';
export { CourseListingService } from './course-listing';
export { CoursePurchaseService } from './course-purchase';
export { InstructorEarningsService } from './instructor-earnings';
export { CourseReviewsService } from './course-reviews';

export type { CourseUploadInput, CourseResponse } from './course-upload';
export type { CourseListFilters, CourseListOptions, CourseListResponse } from './course-listing';
export type { PurchaseInput, PurchaseResponse, RevenueSplit } from './course-purchase';
export type { EarningsResponse, InstructorEarningsResponse } from './instructor-earnings';
export type { ReviewInput, ReviewResponse } from './course-reviews';
