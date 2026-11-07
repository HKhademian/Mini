/* Verify generated value construction and namespace customization from a C host. */
#include "explicit.h"
#define main MINI_ID(generated_main)
#include "generated.c"
#undef main

static const unsigned char sample_bytes[] = { 'o', 'k' };
static const MINI_ID(value) sample_static = MINI_VALUE_TEXT(sample_bytes, 2);

static int sample_text(MINI_ID(value) value) {
    return value.kind == MINI_ID(kind_text)
        && value.text.length == 2
        && value.text.data[0] == 'o'
        && value.text.data[1] == 'k';
}

int main(void) {
    if (!sample_text(sample_static)) return 1;
    if (!sample_text(MINI_ID(value_text)(sample_bytes, 2))) return 2;
    if (!sample_text((MINI_ID(value)) MINI_VALUE_TEXT(sample_bytes, 2))) return 3;
    size_t count = 0;
    MINI_ID(value) once = (MINI_ID(value)) MINI_VALUE_TEXT(sample_bytes, ++count);
    if (count != 1 || once.text.length != 1) return 4;
    return MINI_ID(generated_main)();
}
