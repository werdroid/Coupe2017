// Copyright 2014 Werdroid
// Author Vladimir Kosmala

#include "LS7366R.h"
#include "asserv2017.h"

// Constructors ////////////////////////////////////////////////////////////////

LS7366R::LS7366R(unsigned char _leftSelect, unsigned char _rightSelect, unsigned char _mdr0_conf, unsigned char _mdr1_conf)
{
  leftSelect = _leftSelect;
  rightSelect = _rightSelect;
  mdr0_conf = _mdr0_conf;
  mdr1_conf = _mdr1_conf;

  pinMode(leftSelect, OUTPUT);
  pinMode(rightSelect, OUTPUT);

  digitalWrite(leftSelect, HIGH);
  digitalWrite(rightSelect, HIGH);
}

// Public Methods //////////////////////////////////////////////////////////////

void LS7366R::config()
{
  SPIFIFO.begin(leftSelect, SPI_CLOCK_4MHz);
  SPIFIFO.write(WR | MDR0, SPI_CONTINUE);
  SPIFIFO.write(mdr0_conf);
  SPIFIFO.read();
  SPIFIFO.read();
  SPIFIFO.write(WR | MDR1, SPI_CONTINUE);
  SPIFIFO.write(mdr1_conf);
  SPIFIFO.read();
  SPIFIFO.read();

  SPIFIFO.begin(rightSelect, SPI_CLOCK_4MHz);
  SPIFIFO.write(WR | MDR0, SPI_CONTINUE);
  SPIFIFO.write(mdr0_conf);
  SPIFIFO.read();
  SPIFIFO.read();
  SPIFIFO.write(WR | MDR1, SPI_CONTINUE);
  SPIFIFO.write(mdr1_conf);
  SPIFIFO.read();
  SPIFIFO.read();
}

void LS7366R::reset()
{
  SPIFIFO.begin(leftSelect, SPI_CLOCK_4MHz);
  SPIFIFO.write(CLR | CNTR);
  SPIFIFO.read();

  SPIFIFO.begin(rightSelect, SPI_CLOCK_4MHz);
  SPIFIFO.write(CLR | CNTR);
  SPIFIFO.read();

  leftValue = 0;
  rightValue = 0;
}

void LS7366R::sync()
{
  long count;

  SPIFIFO.begin(leftSelect, SPI_CLOCK_4MHz); // fréquence basse pour un signal le plus clair
  SPIFIFO.clear(); // efface si le buffer est plein
  SPIFIFO.write(LOAD | OTR);
  SPIFIFO.read();

  SPIFIFO.begin(rightSelect, SPI_CLOCK_4MHz);
  SPIFIFO.write(LOAD | OTR);
  SPIFIFO.read();

  SPIFIFO.begin(leftSelect, SPI_CLOCK_4MHz);
  SPIFIFO.write(RD | OTR, SPI_CONTINUE);
  SPIFIFO.read();
  SPIFIFO.write(0, SPI_CONTINUE);
  count = SPIFIFO.read();
  SPIFIFO.write(0, SPI_CONTINUE);
  count <<= 8;
  count |= SPIFIFO.read();
  SPIFIFO.write(0, SPI_CONTINUE);
  count <<= 8;
  count |= SPIFIFO.read();
  SPIFIFO.write(0);
  count <<= 8;
  count |= SPIFIFO.read();
  leftValue = count;

  SPIFIFO.begin(rightSelect, SPI_CLOCK_4MHz);
  SPIFIFO.write(RD | OTR, SPI_CONTINUE);
  SPIFIFO.read();
  SPIFIFO.write(0, SPI_CONTINUE);
  count = SPIFIFO.read();
  SPIFIFO.write(0, SPI_CONTINUE);
  count <<= 8;
  count |= SPIFIFO.read();
  SPIFIFO.write(0, SPI_CONTINUE);
  count <<= 8;
  count |= SPIFIFO.read();
  SPIFIFO.write(0);
  count <<= 8;
  count |= SPIFIFO.read();
  rightValue = count;

  long mask = 0xFFFF0000;
  if ((count & mask) == 16711680 || (count & mask) == -16777216) {
    com_log_print("anomalie sur le codeur droit ");
    com_log_println(count);
  }
}

long LS7366R::left()
{
  return leftValue;
}

long LS7366R::right()
{
  return rightValue;
}
