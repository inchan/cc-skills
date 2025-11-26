## Complete Example: Algorithm Selection (Voting)

### Task
"Implement efficient search algorithm for finding users by email in database with 1M+ records"

### Voting Setup

```markdown
## Algorithm Comparison

### Evaluation Criteria
- **Performance** (50%): Query time for 1M records
- **Memory** (25%): RAM usage during operation
- **Maintainability** (25%): Code clarity and future changes

### Strategies to Compare
1. Linear scan with early termination
2. Binary search with sorted index
3. Hash table with O(1) lookup
```

### Voter Implementations

```markdown
### Voter 1: Linear Scan
```python
def find_by_email_linear(users, email):
    for user in users:
        if user.email == email:
            return user
    return None
```
- Time: O(n) worst case, O(n/2) average
- Memory: O(1)
- Readability: High

---

### Voter 2: Binary Search
```python
def find_by_email_binary(sorted_users, email):
    left, right = 0, len(sorted_users) - 1
    while left <= right:
        mid = (left + right) // 2
        if sorted_users[mid].email == email:
            return sorted_users[mid]
        elif sorted_users[mid].email < email:
            left = mid + 1
        else:
            right = mid - 1
    return None
```
- Time: O(log n)
- Memory: O(1), but requires sorted data
- Readability: Medium

---

### Voter 3: Hash Table
```python
class UserIndex:
    def __init__(self, users):
        self.email_index = {u.email: u for u in users}

    def find_by_email(self, email):
        return self.email_index.get(email)
```
- Time: O(1) average
- Memory: O(n) for index
- Readability: High
```

### Aggregation

```markdown
## Scoring Results

### Benchmark Data (1M records)
| Approach | Query Time | Memory Usage | Code Lines |
|----------|-----------|--------------|------------|
| Linear | 450ms | 1MB | 4 lines |
| Binary | 0.02ms | 1MB + sorting | 12 lines |
| Hash | 0.001ms | 150MB | 8 lines |

### Weighted Scores
| Voter | Performance (50%) | Memory (25%) | Maintainability (25%) | Total |
|-------|-------------------|--------------|------------------------|-------|
| Linear | 3/10 | 10/10 | 9/10 | 5.75 |
| Binary | 8/10 | 8/10 | 7/10 | 7.75 |
| Hash | 10/10 | 4/10 | 9/10 | 8.25 |

### Winner: Hash Table
**Score**: 8.25/10
**Rationale**:
- Fastest query time (critical for UX)
- Memory cost acceptable (150MB for 1M users)
- Simple, maintainable code

### Recommendation
Use hash table approach with lazy loading:
- Index only active users initially
- Build index on startup or first query
- Consider LRU cache for memory optimization
```

