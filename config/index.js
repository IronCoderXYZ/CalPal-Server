const NODE_ENV = process.env.NODE_ENV || 'development';

switch (NODE_ENV) {
  case 'development':
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
    break;
  case 'test':
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
    break;
}
