package set

type Set[T comparable] struct {
	set map[T]struct{}
}

func NewSet[T comparable]() *Set[T] {
	return &Set[T]{
		set: make(map[T]struct{}),
	}
}

func (s *Set[T]) Add(value T) {
	s.set[value] = struct{}{}
}

func (s *Set[T]) Remove(value T) {
	delete(s.set, value)
}

func (s *Set[T]) Contains(value T) bool {
	_, ok := s.set[value]
	return ok
}

func (s *Set[T]) Size() int {
	return len(s.set)
}
