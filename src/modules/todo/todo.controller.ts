import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { User } from '../../common/decorators/user.decorator';
import { CreateTodoDto, UpdateTodoDto } from './todo.dto';
import { UserGuard } from '../../common/guards/user.guard';

@UseGuards(UserGuard)
@Controller('/api/v1/todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async getTodos(@User() user: { id: string; email: string }) {
    return await this.todoService.getTodos(user);
  }

  @Post()
  async createTodo(
    @User() user: { id: string; email: string },
    @Body() request: CreateTodoDto,
  ) {
    return await this.todoService.createTodo(user, request);
  }

  @Get(':id')
  async getTodo(@Param('id') id: string) {
    return await this.todoService.getTodo(id);
  }

  @Put(':id')
  async updateTodo(@Param('id') id: string, @Body() request: UpdateTodoDto) {
    return await this.todoService.updateTodo(id, request);
  }

  @Delete(':id')
  async deleteTodo(@Param('id') id: string) {
    return await this.todoService.deleteTodo(id);
  }
}
