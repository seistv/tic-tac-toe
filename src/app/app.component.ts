import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  // Game state
  board: string[] = Array(9).fill('');
  currentPlayer: string = 'X';
  winner: string | null = null;
  isDraw: boolean = false;
  gameMode: 'PVP' | 'PVC' = 'PVP'; // Game mode
  difficulty: 'Easy' | 'Hard' = 'Easy'; // Difficulty setting

  // Sound effects
  beepSound = new Audio('assets/select-click.wav');
  winSound = new Audio('assets/winning-notification.wav');

  // Reset the game
  resetGame(): void {
    this.board = Array(9).fill('');
    this.currentPlayer = 'X';
    this.winner = null;
    this.isDraw = false;
    this.removeWinningHighlights(); // Remove previous highlights on reset
  }

  // Handle a player making a move
  makeMove(index: number): void {
    if (!this.board[index] && !this.winner) {
      this.board[index] = this.currentPlayer;
      this.beepSound.play(); // Play move sound

      if (this.checkWinner()) {
        this.winner = this.currentPlayer;
        
        // Wait for the board to update before playing the sound and highlighting
        setTimeout(() => {
          this.winSound.play(); // Play win sound
          this.highlightWinningLine(); // Highlight the winning cells
        }, 200); // Slight delay before sound and highlights to ensure board update
      } else if (this.board.every(cell => cell)) {
        this.isDraw = true; // It's a draw if the board is full
      } else {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X'; // Switch player

        // If playing against computer
        if (this.gameMode === 'PVC' && this.currentPlayer === 'O') {
          setTimeout(() => this.makeComputerMove(), 500); // Computer move after slight delay
        }
      }
    }
  }

  // Handle a random move for the computer (Easy difficulty)
  makeRandomMove(): void {
    const availableMoves = this.board
      .map((cell, idx) => (cell === '' ? idx : null))
      .filter(val => val !== null) as number[];

    const randomIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    this.makeMove(randomIndex);
  }

  // Get the best move for the computer (Hard difficulty using minimax)
  getBestMove(): number {
    let bestScore = -Infinity;
    let move = -1;

    this.board.forEach((cell, idx) => {
      if (cell === '') {
        this.board[idx] = 'O';
        const score = this.minimax(this.board, 0, false);
        this.board[idx] = '';
        if (score > bestScore) {
          bestScore = score;
          move = idx;
        }
      }
    });

    return move;
  }

  // Minimax algorithm for determining the best move (for 'Hard' difficulty)
  minimax(board: string[], depth: number, isMaximizing: boolean): number {
    const winner = this.getWinnerFromBoard(board);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (board.every(cell => cell)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      board.forEach((cell, idx) => {
        if (cell === '') {
          board[idx] = 'O';
          bestScore = Math.max(bestScore, this.minimax(board, depth + 1, false));
          board[idx] = '';
        }
      });
      return bestScore;
    } else {
      let bestScore = Infinity;
      board.forEach((cell, idx) => {
        if (cell === '') {
          board[idx] = 'X';
          bestScore = Math.min(bestScore, this.minimax(board, depth + 1, true));
          board[idx] = '';
        }
      });
      return bestScore;
    }
  }

  // Get the winner from the current board
  getWinnerFromBoard(board: string[]): string | null {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of winPatterns) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  }

  // Function to highlight the winning line
  highlightWinningLine(): void {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    const winningPattern = winPatterns.find(([a, b, c]) => {
      return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
    });

    if (winningPattern) {
      const [a, b, c] = winningPattern;
      // Add winner class to the winning cells
      document.getElementById(`cell-${a}`)?.classList.add('winner');
      document.getElementById(`cell-${b}`)?.classList.add('winner');
      document.getElementById(`cell-${c}`)?.classList.add('winner');
    }
  }

  // Remove previous winning highlights (for reset or new game)
  removeWinningHighlights(): void {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.classList.remove('winner');
    });
  }

  // Handle computer move for 'PVC' mode
  makeComputerMove(): void {
    if (this.difficulty === 'Easy') {
      this.makeRandomMove();
    } else {
      const bestMove = this.getBestMove();
      this.makeMove(bestMove);
    }
  }

  // Check if the game is won or drawn
  checkWinner(): boolean {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    return winPatterns.some(([a, b, c]) => {
      return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
    });
  }
}