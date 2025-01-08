import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
  ) {}

  async submitAssignment(createSubmissionDto: CreateSubmissionDto) {
    const { studentId, studentName, assignmentId, file, content } =
      createSubmissionDto;

    // Check if the assignment exists
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID ${assignmentId} not found`,
      );
    }

    // Create a new submission with content
    const submission = this.submissionRepository.create({
      studentId, // Ensure this is valid according to the Submission entity
      studentName, // Include studentName here
      assignment,
      file,
      content, // Include content here
      status: 'submitted', // Default status
    });

    await this.submissionRepository.save(submission); // Save the submission

    // Return the submission with the dueDate from the associated assignment
    return {
      ...submission,
      assignment: {
        ...submission.assignment,
        dueDate: assignment.dueDate, // Add the dueDate from the assignment
      },
    };
  }
}
