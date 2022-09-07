import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import Task from './task.entity';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(payload: Task) {
    return this.tasksRepository.save(payload);
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = new Task();
    const payload = {
      title,
      description,
      status: TaskStatus.OPEN,
    };
    Object.assign(task, payload);
    const savedTask = await this.create(task);

    return savedTask;
  }

  async findById(id: string): Promise<Task> {
    return this.tasksRepository.findOne({ where: { id: id } });
  }

  async deleteById(id: string): Promise<void> {
    const result = await this.tasksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ${id} not found`);
    }
  }

  async updateTask(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.findById(id);
    task.status = status;
    this.tasksRepository.save(task);

    return task;
  }

  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { status, search } = filterDto;

    if (status) {
      return this.tasksRepository.find({ where: { status: status } });
    }

    if (search) {
      return this.tasksRepository.find({
        where: [{ title: search }, { description: search }],
      });
    }

    const tasks = await this.tasksRepository.find();
    return tasks;
  }
}
