describe('Simple Test Suite', () => {
  test('1 + 1 should equal 2', () => {
    expect(1 + 1).toBe(2);
  });

  test('should work with strings', () => {
    const text = 'hello';
    expect(text).toBe('hello');
    expect(text).toHaveLength(5);
  });

  test('should work with arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toContain(2);
    expect(arr).toHaveLength(3);
  });
});
