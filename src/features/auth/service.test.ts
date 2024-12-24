import { authService } from './service';
import { UserModel } from '../users/model';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw error when user not found', async () => {
      const mockFindOne = jest
        .spyOn(UserModel, 'findOne')
        .mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password',
        })
      ).rejects.toThrow('Invalid credentials');

      expect(mockFindOne).toHaveBeenCalled();
    });
  });
});
