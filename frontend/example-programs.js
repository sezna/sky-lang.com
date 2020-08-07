let exampleCode = {
  twinkle: `-- helper functions you use must be declared before main

fn pointless_if_comparison(num: number): pitch_rhythm {
   -- ifs are expressions
   return if num < 5 then a4 quarter else e4 quarter; 
}

-- all sky programs need a main function which returns the contents of the music

fn main(): list list pitch_rhythm {

  -- lists of pitches with associated rhythms can be interpreted as parts to a piece

  list pitch_rhythm twinkle_twinkle_melody =
     [d4 quarter, d4 quarter, a4 quarter, a#4 quarter,
      b4 quarter, b4 quarter, a4 half];

  list pitch_rhythm twinkle_twinkle_harmony =
     [d3 half,               \\f#3, a3\\ half,
      f#3 dotted eighth, g3 sixteenth, f#3 eighth, b2 eighth, \\e3, c#3\\ half ];


  -- combining these two lists into a 2d list means that the piece has multiple parts

  list list pitch_rhythm twinkle_twinkle = [twinkle_twinkle_melody, twinkle_twinkle_harmony];

  -- parts can be indexed and assigned properties as seen fit
  twinkle_twinkle.key        = d major;
  twinkle_twinkle[0].dynamic = f;
  twinkle_twinkle[0].part_id = melody;
  twinkle_twinkle[0][3]      = pointless_if_comparison(3);
  twinkle_twinkle[1].part_id = harmony;
  twinkle_twinkle[1].dynamic = mp;
  twinkle_twinkle[1].clef    = bass;

  -- whatever is returned from \`main\` is what is rendered on the right
  return twinkle_twinkle;
}`,
  beetsFifth: `fn main(): list list pitch_rhythm {
    list pitch_rhythm treble_part = [
        _ eighth, g4 eighth, g4 eighth, g4 eighth,
        eb4 half,
        _ eighth, f4 eighth, f4 eighth, f4 eighth,
        d4 half,
        _ eighth, g4 eighth, g4 eighth, g4 eighth,
        _ eighth, ab4 eighth, ab4 eighth, ab4 eighth,
        ];
        treble_part[0].dynamic = ff;
        treble_part[11].dynamic = p;
        
    list pitch_rhythm bass_part_one = [
        _ eighth, \\eb5, eb4\\ eighth, \\eb5, eb4\\ eighth, \\eb5, eb4\\ eighth,
        \\c5, c4\\ half,
        _ eighth
    ];
    
    
    list pitch_rhythm bass_part_two = [
        \\d5, d4\\ eighth, \\d5, d4\\ eighth, \\d5, d4\\ eighth
    ];

    list pitch_rhythm bass_part = bass_part_one + bass_part_two;
        
    
    list list pitch_rhythm beethovens_fifth = [treble_part, bass_part];
    beethovens_fifth.key = c minor;
    beethovens_fifth.time = 2/4;
    
    beethovens_fifth.composer = Ludwig van Beethoven;
    beethovens_fifth.title = Symphony No. 5 in C Minor;
    
    return beethovens_fifth;

}`};
