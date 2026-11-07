/* Verify generated value construction and namespace customization from a C host. */
#define main MINI_ID(generated_main)
#include "generated.c"
#undef main

static const unsigned char sample_bytes[] = { 'o', 'k' };
static const MINI_VALUE sample_static = MINI_VALUE_TEXT(sample_bytes, 2);

static int sample_text(MINI_VALUE value) {
    return value.kind == MINI_ID(kind_text)
        && value.text.length == 2
        && value.text.data[0] == 'o'
        && value.text.data[1] == 'k';
}

int main(void) {
    if (!sample_text(sample_static)) return 1;
    if (!sample_text(MINI_ID(value_text)(sample_bytes, 2))) return 2;
    if (!sample_text((MINI_VALUE) MINI_VALUE_TEXT(sample_bytes, 2))) return 3;
    size_t count = 0;
    MINI_VALUE once = (MINI_VALUE) MINI_VALUE_TEXT(sample_bytes, ++count);
    if (count != 1 || once.text.length != 1) return 4;
    return MINI_ID(generated_main)();
}
