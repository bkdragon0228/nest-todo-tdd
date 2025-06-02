import { Controller, UseGuards } from '@nestjs/common';
import { TodoService } from './todo.service';
import { UserGuard } from 'src/common/guards/user.guard';

@UseGuards(UserGuard)
@Controller('/api/v1/todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}
}
