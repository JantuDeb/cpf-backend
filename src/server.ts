import app from './app';
import env from './lib/env';

const PORT = env.PORT || 8000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
